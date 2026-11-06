import 'dotenv/config';
import path from 'path';
import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { readMigrationFiles } from 'drizzle-orm/migrator';

const migrationsFolder = path.join(__dirname, '../../drizzle');

// Any key works as long as nothing else in the app takes the same advisory lock.
const MIGRATION_LOCK_KEY = 155;

/**
 * Databases created before migrations were introduced already have the tables
 * in `0000_baseline.sql`. Record the baseline as applied on such a database so
 * that the migrator does not try to create them again.
 */
async function markBaselineIfExistingDatabase(client: Client) {
  await client.query('CREATE SCHEMA IF NOT EXISTS drizzle');
  await client.query(`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `);

  const applied = await client.query(
    'SELECT 1 FROM drizzle.__drizzle_migrations LIMIT 1',
  );
  if (applied.rowCount > 0) {
    return;
  }

  const existing = await client.query(
    "SELECT to_regclass('public.tb_user') IS NOT NULL AS exists",
  );
  if (!existing.rows[0].exists) {
    return;
  }

  const [baseline] = readMigrationFiles({ migrationsFolder });
  await client.query(
    'INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)',
    [baseline.hash, baseline.folderMillis],
  );
  console.log('Marked the baseline migration as applied on an existing DB');
}

/** Applies the pending migrations in `drizzle/` to the database. */
export async function runMigrations() {
  const client = new Client({
    host: process.env.DB_HOST ?? 'localhost',
    database: process.env.POSTGRESQL_DATABASE,
    user: process.env.POSTGRESQL_USERNAME,
    password: process.env.POSTGRESQL_PASSWORD,
  });
  await client.connect();

  try {
    await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK_KEY]);
    await markBaselineIfExistingDatabase(client);
    await migrate(drizzle(client), { migrationsFolder });
    console.log('Database migrations are up to date');
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  runMigrations().catch((e) => {
    console.error('Failed to run database migrations >> ', e);
    process.exit(1);
  });
}
