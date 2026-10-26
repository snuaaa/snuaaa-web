# DB migration

API의 DB 스키마는 [drizzle-kit](https://orm.drizzle.team/docs/kit-overview) migration으로만 바꾼다. 서버는 더 이상 `sequelize.sync()`를 호출하지 않는다.

## 구성

| 경로 | 설명 |
| --- | --- |
| `packages/api/src/db/schema.ts` | Drizzle 스키마. migration 생성의 기준이다. |
| `packages/api/drizzle/` | 생성된 migration SQL과 `meta/` (snapshot, journal). 직접 고치지 않는다. |
| `packages/api/drizzle.config.ts` | drizzle-kit 설정. DB 접속 정보는 `packages/api/.env`를 그대로 쓴다. |
| `packages/api/src/db/migrate.ts` | 밀린 migration을 적용한다. |
| `packages/api/src/db/baseline.ts` | 기존 DB에 baseline(`0000_baseline`)을 "이미 적용됨"으로 표시한다. |

적용된 migration은 DB의 `drizzle.__drizzle_migrations` 테이블에 기록된다. migrator는 이 테이블의 마지막 `created_at`보다 나중에 만들어진 migration만 실행한다.

| 명령 (`packages/api`에서) | 빌드된 이미지에서 | 설명 |
| --- | --- | --- |
| `pnpm db:generate` | - | `schema.ts`와 마지막 snapshot의 차이로 새 migration을 만든다. |
| `pnpm db:migrate` | `node dist/db/migrate.js` | 밀린 migration을 적용한다. |
| `pnpm db:baseline` | `node dist/db/baseline.js` | 기존 DB에 baseline을 적용됨으로 표시한다. 한 DB에 한 번만 쓴다. |

Docker 이미지에는 `dist/`와 `drizzle/`이 함께 들어가므로, 서버에서는 API 컨테이너 안에서 `node dist/db/*.js`로 실행하면 된다. 컨테이너의 환경 변수로 DB에 접속한다.

## 로컬 개발 DB를 처음부터 만들기

```bash
docker run -d --name snuaaa-db -p 5432:5432 \
  -e POSTGRES_USER=snuaaa -e POSTGRES_PASSWORD=snuaaa -e POSTGRES_DB=snuaaa \
  postgres:16
```

`packages/api/.env`에 `DB_HOST=localhost`, `POSTGRESQL_DATABASE=snuaaa`, `POSTGRESQL_USERNAME=snuaaa`, `POSTGRESQL_PASSWORD=snuaaa`를 넣고 실행한다.

```bash
pnpm --filter @snuaaa/api db:migrate
```

테이블만 만들어지고 데이터(게시판 `tb_board`, 유저 등)는 없다. 필요하면 dev DB 덤프를 복원해서 쓴다. 덤프를 복원한 DB에는 `drizzle.__drizzle_migrations`도 같이 들어오므로 `db:migrate`만 다시 실행하면 된다.

## 스키마 바꾸기

1. Sequelize 모델(`src/models/*.ts`)과 `src/db/schema.ts`를 같이 고친다. ORM 전환(#158)이 끝날 때까지는 두 곳을 맞춰야 한다.
2. `pnpm --filter @snuaaa/api db:generate --name <설명>`으로 migration을 만든다. 생성된 SQL을 꼭 읽어 본다. 컬럼 이름 변경은 drop + add로 나올 수 있다(대화형으로 물어보면 rename을 고른다). 데이터 이전처럼 생성할 수 없는 변경은 `db:generate --custom --name <설명>`으로 빈 파일을 만들어 SQL을 직접 쓴다.
3. 로컬 DB에 `pnpm --filter @snuaaa/api db:migrate`로 적용해서 확인하고, `schema.ts`와 `drizzle/`을 같은 PR로 올린다.
4. 배포할 때 서버의 API 컨테이너에서 `node dist/db/migrate.js`를 실행한다. 지금은 배포 workflow가 migration을 자동으로 실행하지 않는다.
   - 새 코드가 새 스키마를 필요로 하므로, 새 이미지를 띄운 직후(또는 띄우기 전에 새 이미지로) 실행한다.
   - 기존 코드도 계속 돌아가도록 expand → contract 순서로 나눈다. 컬럼 추가는 먼저 하고, 삭제는 그 컬럼을 쓰는 코드가 모두 배포된 뒤 별도 migration으로 한다.
5. 이미 어딘가에 적용된 migration 파일은 고치지 않는다. 잘못됐으면 새 migration으로 되돌린다.

## 기존 DB(prod / dev)에 처음 도입하기

`0000_baseline.sql`은 Sequelize 모델에 `sync()`를 돌린 빈 DB를 `drizzle-kit pull`로 introspect해서 만들었다. 즉 **모델 정의 기준**이다. `sync()`는 기존 테이블의 컬럼 변경을 반영하지 않았기 때문에, 실제 prod 스키마와 다를 수 있다. 아래 순서로 차이를 정리한 뒤 baseline을 표시한다. dev에서 먼저 해 보고 prod에 한다.

`sync()` 제거 자체는 baseline 표시 전에 배포해도 안전하다. 기존 DB에는 이미 모든 테이블이 있어서, 그동안 `sync()`가 하던 일이 없었다.

### 1. 백업

DB에 접속할 수 있는 곳(서버 또는 DB와 같은 네트워크)에서 실행한다.

```bash
# 전체 백업 (custom format, pg_restore로 복원)
pg_dump -h <DB_HOST> -U <USER> -d <DB> -Fc -f snuaaa-<env>-$(date +%Y%m%d).dump
# 백업 파일이 읽히는지 확인
pg_restore --list snuaaa-<env>-<date>.dump | head
```

백업 파일은 서버 밖(로컬, S3 등)에도 한 부 둔다. 복원은 빈 DB에 `pg_restore -h <DB_HOST> -U <USER> -d <새 DB> --no-owner snuaaa-<env>-<date>.dump`로 한다. 복원 연습은 로컬 DB에 해 본다.

### 2. 실제 스키마와 baseline 비교

```bash
# 실제 DB의 스키마
pg_dump -h <DB_HOST> -U <USER> -d <DB> --schema-only --no-owner --no-privileges -n public > actual.sql

# baseline으로 만든 빈 DB의 스키마 (로컬)
pnpm --filter @snuaaa/api db:migrate      # 로컬 빈 DB에 적용
pg_dump -h localhost -U snuaaa -d snuaaa --schema-only --no-owner --no-privileges -n public > baseline.sql

diff baseline.sql actual.sql
```

`drizzle-kit pull`을 실제 DB에 돌려 나온 `schema.ts`를 `src/db/schema.ts`와 비교해도 된다(결과물은 커밋하지 않는다). pull은 `packages/api/.env`의 DB에 접속하므로, 백업에서 복원한 로컬 DB에 돌리는 편이 안전하다.

### 3. 차이 정리

baseline을 어느 DB에도 표시하기 전이라면 baseline 자체를 고칠 수 있다.

- **실제 DB에만 있는 것** (컬럼, 테이블, 인덱스, 제약 조건 등)
  - 쓰는 것이면 Sequelize 모델과 `schema.ts`에 추가한다.
  - 안 쓰는 것이면 baseline에는 넣지 않고, baseline 표시 후 삭제 migration을 따로 만든다(삭제 전에 백업 확인).
- **모델에만 있는 것**: 코드가 그 컬럼을 쓰면 지금도 에러가 나고 있을 것이다. 실제 DB에 맞춰 모델을 고치거나, baseline 표시 후 추가 migration을 만든다.
- **타입·길이·NOT NULL·기본값 차이**: 대부분 실제 DB에 맞춰 `schema.ts`(와 모델)를 고친다.

`schema.ts`를 고쳤다면 baseline을 다시 만든다.

```bash
cd packages/api
rm -rf drizzle
pnpm db:generate --name baseline
```

다시 만든 baseline으로 2단계의 diff가 비면(또는 의도한 차이만 남으면) 다음으로 넘어간다. prod와 dev가 서로 다르면 prod를 기준으로 맞추고, dev는 차이를 migration으로 따라가게 하거나 prod 덤프로 다시 만든다.

### 4. baseline 표시

baseline이 들어간 이미지가 배포된 뒤, 서버의 API 컨테이너에서 실행한다.

```bash
docker exec <api 컨테이너> node dist/db/baseline.js
docker exec <api 컨테이너> node dist/db/migrate.js   # baseline 이후 migration이 있으면 적용, 없으면 아무 일도 하지 않는다
```

`baseline.js`는 baseline의 SQL을 실행하지 않고 `drizzle.__drizzle_migrations`에 기록만 남긴다. `tb_content`가 없는 빈 DB이거나 이미 migration 기록이 있으면 아무것도 하지 않고 끝난다.

**baseline을 표시하기 전에 그 DB에 `migrate.js`를 실행하면 안 된다.** 기록이 없으므로 baseline의 `CREATE TABLE`을 실행하려다 실패한다(트랜잭션이라 DB는 바뀌지 않는다).
