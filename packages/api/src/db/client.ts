import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { DB_TIMEOUTS } from './timeouts';

/**
 * The Drizzle connection pool, used by `repositories/`. Sequelize keeps its
 * own pool (`models/sequelize.ts`) until every domain has moved (#158).
 */
export const pool = new Pool({
  host: process.env.DB_HOST ?? 'localhost',
  database: process.env.POSTGRESQL_DATABASE,
  user: process.env.POSTGRESQL_USERNAME,
  password: process.env.POSTGRESQL_PASSWORD,
  max: 5,
  connectionTimeoutMillis: DB_TIMEOUTS.acquire,
  lock_timeout: DB_TIMEOUTS.lock,
  statement_timeout: DB_TIMEOUTS.statement,
  idle_in_transaction_session_timeout: DB_TIMEOUTS.idleInTransaction,
});

export const db = drizzle(pool, { schema });

/** A transaction handle from `withTransaction` (`db/transaction.ts`). */
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Where a repository function runs its query: the pool, or a transaction. */
export type Executor = typeof db | Tx;
