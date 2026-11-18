import { database, type Transaction } from './client';

export type { Transaction };

/**
 * Runs `work` in one Drizzle transaction: it commits when `work` resolves
 * and rolls back when it throws, rethrowing the error. Every query that
 * should be part of it must run on `transaction`; a query on `database` runs
 * outside the transaction.
 *
 * Only Drizzle repositories can join it. Sequelize keeps its own connections,
 * so a domain gets transactions once its writes move to Drizzle (#158).
 */
export function withTransaction<T>(
  work: (transaction: Transaction) => Promise<T>,
): Promise<T> {
  return database.transaction(work);
}
