import { db, type Tx } from './client';

export type { Tx };

/**
 * Runs `fn` in one Drizzle transaction: it commits when `fn` resolves and
 * rolls back when it throws, rethrowing the error. Every query that should be
 * part of it must run on `tx`; a query on `db` runs outside the transaction.
 *
 * Only Drizzle repositories can join it. Sequelize keeps its own connections,
 * so a domain gets transactions once its writes move to Drizzle (#158).
 */
export function withTransaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  return db.transaction(fn);
}
