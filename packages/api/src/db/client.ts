import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { DATABASE_TIMEOUTS } from './timeouts';

/**
 * The connection pool every query uses (`repositories/`). It has the 10
 * connections the Drizzle and Sequelize pools had together (5 each) before
 * Sequelize was removed (#158).
 */
export const pool = new Pool({
  host: process.env.DB_HOST ?? 'localhost',
  database: process.env.POSTGRESQL_DATABASE,
  user: process.env.POSTGRESQL_USERNAME,
  password: process.env.POSTGRESQL_PASSWORD,
  max: 10,
  connectionTimeoutMillis: DATABASE_TIMEOUTS.acquire,
  lock_timeout: DATABASE_TIMEOUTS.lock,
  statement_timeout: DATABASE_TIMEOUTS.statement,
  idle_in_transaction_session_timeout: DATABASE_TIMEOUTS.idleInTransaction,
});

// A pooled connection that drops while idle (e.g. the DB restarts) emits
// `error` on the pool. Without a listener that would crash the process; the
// pool already discards the broken client and opens a new one when needed.
pool.on('error', (error) => {
  console.error('Idle PostgreSQL client error', error);
});

export const database = drizzle(pool, { schema });

/** A transaction handle from `withTransaction` (`db/transaction.ts`). */
export type Transaction = Parameters<
  Parameters<typeof database.transaction>[0]
>[0];

/** Where a repository function runs its query: the pool, or a transaction. */
export type Executor = typeof database | Transaction;
