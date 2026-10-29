# DB migrations

The API's PostgreSQL schema is managed by the SQL migrations in this folder, run with the [drizzle-kit](https://orm.drizzle.team/docs/kit-overview) migrator. Sequelize models no longer create or change tables (`sequelize.sync()` was removed), so every schema change needs a migration.

- `0000_baseline.sql` is the schema as it was when migrations were introduced.
- `meta/_journal.json` lists the migrations in order. drizzle-kit writes it, so don't edit it by hand.
- Applied migrations are recorded in the `drizzle.__drizzle_migrations` table.

## When migrations run

The API runs pending migrations on startup (`src/db/migrate.ts`, called from `main.ts`) and only starts listening once they succeed. If a migration fails, the whole batch is rolled back and the process exits.

A database that already has the tables (prod and dev, which were created by `sync()`) but no `drizzle.__drizzle_migrations` rows gets the baseline recorded as applied instead of run. An empty database runs the baseline and is created from scratch.

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

Create an empty database, set the `POSTGRESQL_*` and `DB_HOST` variables in `packages/api/.env`, and either start the API or run `pnpm db:migrate`. The baseline creates every table.

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
