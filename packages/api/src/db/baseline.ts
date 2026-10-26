// Marks the baseline migration (0000) as already applied on a database whose
// schema predates the migration system (prod / dev), without running its SQL.
// Usage: `pnpm db:baseline` (ts-node) or `node dist/db/baseline.js` (built image).
// See docs/db-migration.md before running this against a shared database.
import { readMigrationFiles } from 'drizzle-orm/migrator';
import {
  createClient,
  MIGRATIONS_FOLDER,
  MIGRATIONS_SCHEMA,
  MIGRATIONS_TABLE,
} from './connection';

const table = `"${MIGRATIONS_SCHEMA}"."${MIGRATIONS_TABLE}"`;

async function main() {
  const [baseline] = readMigrationFiles({
    migrationsFolder: MIGRATIONS_FOLDER,
  });
  if (!baseline) {
    throw new Error(`No migrations found in ${MIGRATIONS_FOLDER}`);
  }

  const client = createClient();
  await client.connect();
  try {
    const existing = await client.query<{ exists: boolean }>(
      "SELECT to_regclass('public.tb_content') IS NOT NULL AS exists",
    );
    if (!existing.rows[0].exists) {
      throw new Error(
        'tb_content does not exist. This looks like an empty database, so run `db:migrate` instead.',
      );
    }

    await client.query('BEGIN');
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${MIGRATIONS_SCHEMA}"`);
    await client.query(
      `CREATE TABLE IF NOT EXISTS ${table} (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at bigint)`,
    );
    const applied = await client.query(`SELECT 1 FROM ${table} LIMIT 1`);
    if (applied.rowCount > 0) {
      await client.query('ROLLBACK');
      console.log(
        'Migrations are already tracked on this database; nothing to do',
      );
      return;
    }
    await client.query(
      `INSERT INTO ${table} (hash, created_at) VALUES ($1, $2)`,
      [baseline.hash, baseline.folderMillis],
    );
    await client.query('COMMIT');
    console.log('Baseline marked as applied');
  } catch (e) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw e;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('Baseline failed >> ', e);
  process.exit(1);
});
