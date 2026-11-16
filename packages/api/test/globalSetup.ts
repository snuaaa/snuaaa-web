import { Client } from 'pg';
import { testEnv } from './env';
import { runMigrations } from '../src/db/migrate';

/**
 * Recreates the test database and builds its schema from the migrations in
 * `drizzle/`, once per test run. This also checks that the migrations apply
 * to an empty database.
 */
export default async function setup() {
  const admin = new Client({
    host: testEnv.DB_HOST,
    user: testEnv.POSTGRESQL_USERNAME,
    password: testEnv.POSTGRESQL_PASSWORD,
    database: 'postgres',
  });
  await admin.connect();
  try {
    const db = `"${testEnv.POSTGRESQL_DATABASE}"`;
    await admin.query(`DROP DATABASE IF EXISTS ${db} WITH (FORCE)`);
    await admin.query(`CREATE DATABASE ${db}`);
  } finally {
    await admin.end();
  }

  await runMigrations();
}
