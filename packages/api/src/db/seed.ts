import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Client } from 'pg';
import uuid4 from 'uuid4';
import { runMigrations } from './migrate';

const seedFile = path.join(__dirname, '../../seed/base.sql');

// Hosts that point at a DB on the developer's own machine. `host.docker.internal`
// is what `.envExample` uses when the API runs in a local Docker container.
const LOCAL_DB_HOSTS = [
  'localhost',
  '127.0.0.1',
  '::1',
  'host.docker.internal',
];

const ADMIN_ID = process.env.SEED_ADMIN_ID || 'admin';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'snuaaa2026';

/**
 * The seed must never reach the dev or prod DB. Both run with NODE_ENV=develop
 * or production, so check where the DB is rather than NODE_ENV alone.
 */
function assertLocalDatabase() {
  const host = process.env.DB_HOST ?? 'localhost';
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed: NODE_ENV is production.');
  }
  if (!LOCAL_DB_HOSTS.includes(host)) {
    throw new Error(
      `Refusing to seed: DB_HOST "${host}" is not a local DB (${LOCAL_DB_HOSTS.join(', ')}).`,
    );
  }
}

/** Creates a grade 1 (most privileged) account, unless the ID is taken. */
async function seedAdmin(client: Client) {
  // tb_user.id has no unique constraint, so check before inserting.
  const existing = await client.query('SELECT 1 FROM tb_user WHERE id = $1', [
    ADMIN_ID,
  ]);
  if (existing.rowCount > 0) {
    console.log(`Admin account "${ADMIN_ID}" already exists, skipped`);
    return;
  }

  await client.query(
    `INSERT INTO tb_user
       (user_uuid, id, password, username, nickname, email, grade, level, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $4, $5, 1, 0, now(), now())`,
    [
      uuid4(),
      ADMIN_ID,
      bcrypt.hashSync(ADMIN_PASSWORD, 8),
      '관리자',
      'admin@localhost',
    ],
  );
  console.log(`Created admin account "${ADMIN_ID}"`);
}

/** Fills a local DB with the base data and an admin account. */
async function seed() {
  assertLocalDatabase();
  await runMigrations();

  const client = new Client({
    host: process.env.DB_HOST ?? 'localhost',
    database: process.env.POSTGRESQL_DATABASE,
    user: process.env.POSTGRESQL_USERNAME,
    password: process.env.POSTGRESQL_PASSWORD,
  });
  await client.connect();

  try {
    await client.query('BEGIN');
    await client.query(fs.readFileSync(seedFile, 'utf8'));
    await seedAdmin(client);
    await client.query('COMMIT');
    console.log('Seeded the base data');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    await client.end();
  }
}

seed().catch((e) => {
  console.error('Failed to seed the DB >> ', e);
  process.exit(1);
});
