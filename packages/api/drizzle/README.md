# DB migrations

The API's PostgreSQL schema is managed by the SQL migrations in this folder, run with the [drizzle-kit](https://orm.drizzle.team/docs/kit-overview) migrator. Sequelize models no longer create or change tables (`sequelize.sync()` was removed), so every schema change needs a migration.

- `0000_baseline.sql` is the prod schema as it was when migrations were introduced, dumped on 2026-11-01. It leaves out `tb_file_orphan_backup`, a leftover backup table that only exists on prod. It also keeps legacy columns the models no longer use (`tb_photo.album_id`, `tb_exhibit_photo.exhibition_id`).
- `meta/_journal.json` lists the migrations in order. drizzle-kit writes it, so don't edit it by hand.
- Applied migrations are recorded in the `drizzle.__drizzle_migrations` table.

## When migrations run

The API runs pending migrations on startup (`src/db/migrate.ts`, called from `main.ts`) and only starts listening once they succeed. If a migration fails, the whole batch is rolled back and the process exits.

A database that already has the tables (prod and dev, which were created by `sync()`) but no `drizzle.__drizzle_migrations` rows gets the baseline recorded as applied instead of run. An empty database runs the baseline and is created from scratch. A database that has only some of the baseline tables is rejected, and the API doesn't start.

You can also run them by hand from `packages/api`:

```bash
pnpm db:migrate
```

## Adding a migration

Drizzle table definitions don't exist yet (see #158), so migrations are written by hand:

```bash
pnpm db:generate --name add_user_nickname
```

This creates `drizzle/NNNN_add_user_nickname.sql` and updates the journal. Write the SQL below the generated comment line, separating statements with `--> statement-breakpoint`. Then update the Sequelize model to match, and run `pnpm db:migrate` against your local DB.

Never edit a migration that has already been deployed. Add a new one instead.

## Setting up a local DB

Create an empty database on PostgreSQL 10 or later (16 recommended; the baseline uses `CREATE SEQUENCE ... AS integer`, which 9.x rejects), set the `POSTGRESQL_*` and `DB_HOST` variables in `packages/api/.env`, and either start the API or run `pnpm db:migrate`. The baseline creates every table.

A local DB created before migrations were introduced (by `sequelize.sync()`) does not match the baseline, but would still be marked as applied. Drop it and create an empty one instead.

## Local seed data

An empty DB has no boards, so most pages show nothing. Fill a local DB with:

```bash
pnpm db:seed
```

`src/db/seed.ts` runs the pending migrations, then applies `seed/base.sql` (the boards shown in prod, their categories and tags, and equipment categories, copied from the dev DB) and creates a grade 1 admin account. The account is `admin` / `snuaaa2026` unless `SEED_ADMIN_ID` and `SEED_ADMIN_PASSWORD` are set in `.env`. Rows that already exist are skipped, so it is safe to run again.

The seed is for local DBs only. It refuses to run when `NODE_ENV` is `production` or `DB_HOST` isn't `localhost`, `127.0.0.1`, `::1` or `host.docker.internal`. It is not a migration, so it never runs on dev or prod. The host check can't tell a remote DB forwarded to `localhost` (e.g. an SSH tunnel), so don't run it while such a tunnel is open.

To refresh `seed/base.sql` after the boards change on the dev DB:

```bash
pg_dump --data-only --inserts --column-inserts --no-owner \
  -t public.tb_board -t public.tb_category -t public.tb_tag -t public.tb_equipment_category \
  "$DATABASE_URL"
```

Then copy the `INSERT` lines into `seed/base.sql`, keeping `tb_board` first and `ON CONFLICT DO NOTHING` on each.

## Backups

Take a backup before deploying a migration to prod, and before any manual change to a server's DB:

```bash
pg_dump --format=custom --file=snuaaa-$(date +%Y%m%d-%H%M%S).dump "$DATABASE_URL"
```

Restore into an empty database with:

```bash
pg_restore --no-owner --dbname="$DATABASE_URL" snuaaa-YYYYMMDD-HHMMSS.dump
```

## Regenerating the baseline

`0000_baseline.sql` must match the prod schema. To regenerate it from a database:

```bash
scripts/dump-baseline.sh "postgres://user:password@host:5432/snuaaa"
```

The script runs `pg_dump --schema-only` and strips the session settings the migrator can't run. Only regenerate it before it has been deployed, since an already-marked database won't notice the change.
