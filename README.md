# SNUAAA HOMEPAGE

[Homepage](https://our.snuaaa.net/)

# About the Project

This project is for the website community of the [Seoul National University Amateur Astronomy Association](https://our.snuaaa.net/).

It is a [pnpm](https://pnpm.io/) workspace monorepo with two packages:

| Package | Path | Description |
| --- | --- | --- |
| `@snuaaa/community-web` | `packages/community` | Community web app (React SPA) |
| `@snuaaa/api` | `packages/api` | REST API server (Express + PostgreSQL) |

# Getting Started

### 1. Install packages

In the project root directory.

```bash
pnpm i
```

### 2. Set environment variables

`packages/community/.env`

```bash
REACT_APP_SERVER_URL=http://localhost:8080/
```

`packages/api/.env`

```bash
NODE_ENV=develop
PORT=8080
DB_HOST=localhost
POSTGRESQL_DATABASE=
POSTGRESQL_USERNAME=
POSTGRESQL_PASSWORD=
JWT_SECRET=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
```

### 3. Run SNUAAA community web

In the project root directory. The dev server runs on http://localhost:3000.

```bash
pnpm dev
```

### 4. Run API server

Create an empty PostgreSQL (10 or later, 16 recommended) database for `POSTGRESQL_DATABASE`. If you have a local DB created before migrations were introduced, drop it and start from an empty one. The API runs the migrations in `packages/api/drizzle/` on startup, so the tables are created the first time it starts.

```bash
pnpm --filter @snuaaa/api dev
```

To fill the local DB with the boards, categories, tags and an admin account (`admin` / `snuaaa2026`), run the seed once. See [Local seed data](packages/api/drizzle/README.md#local-seed-data).

```bash
pnpm --filter @snuaaa/api db:seed
```

### 5. Run API tests

The API tests need a PostgreSQL server but not the API's `.env`. Each run drops and recreates a database named `snuaaa_test` (never your dev DB). They connect to `localhost` as `postgres` / `postgres` by default; set `TEST_DB_HOST`, `TEST_POSTGRESQL_USERNAME`, `TEST_POSTGRESQL_PASSWORD` or `TEST_POSTGRESQL_DATABASE` (must end with `_test`) to change that. The user needs permission to create databases.

```bash
docker run -d --name snuaaa-test-db -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16
pnpm --filter @snuaaa/api test
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm build` | Build the community web (`packages/community/build`) |
| `pnpm --filter @snuaaa/community-web lint` | Lint the community web |
| `pnpm --filter @snuaaa/api build` | Compile the API server (`packages/api/dist`) |
| `pnpm --filter @snuaaa/api lint` | Lint the API server |
| `pnpm --filter @snuaaa/api format` | Format the API server with Prettier |
| `pnpm --filter @snuaaa/api test` | Run the API tests (needs a local PostgreSQL, see below) |
| `pnpm --filter @snuaaa/api db:migrate` | Apply pending DB migrations ([details](packages/api/drizzle/README.md)) |
| `pnpm --filter @snuaaa/api db:generate --name <name>` | Add an empty SQL migration |
| `pnpm --filter @snuaaa/api db:seed` | Fill a local DB with base data and an admin account ([details](packages/api/drizzle/README.md#local-seed-data)) |

## Deployment

| Trigger | Web | API |
| --- | --- | --- |
| Push to `main` | Cloudflare Pages (preview) | Dev server |
| Release tagged `WEB-*` | Cloudflare Pages (production) | - |
| Release tagged `API-*` | - | Production server |

## Stacks

### Web

- [React](https://reactjs.org/)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [tailwindcss](https://tailwindcss.com/)
- [CKEditor](https://ckeditor.com/)
- [REMIX ICON](https://remixicon.com/)
- [Vite](https://vite.dev/)

### API

- [Express](https://expressjs.com/)
- [Sequelize](https://sequelize.org/) + [PostgreSQL](https://www.postgresql.org/)
- [drizzle-kit](https://orm.drizzle.team/docs/kit-overview) migrations
- [JWT](https://jwt.io/)
- [AWS S3](https://aws.amazon.com/s3/)
