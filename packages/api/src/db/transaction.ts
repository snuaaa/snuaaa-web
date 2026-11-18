import type { Transaction } from 'sequelize';
import { sequelize } from '../models/sequelize';

/**
 * A database transaction, handed to data-access functions that take an
 * optional `tx`. Services treat it as opaque, so when a domain moves to
 * Drizzle (#158) only this type and `withTransaction` change.
 */
export type Tx = Transaction;

/**
 * Runs `fn` in one transaction: it commits when `fn` resolves and rolls back
 * when it throws, rethrowing the error. Every query that should be part of it
 * must be passed `tx`; a query without it runs outside the transaction.
 *
 * Sequelize and Drizzle can't share a transaction, so all the writes one
 * service makes in a transaction must use the same ORM.
 */
export function withTransaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  return sequelize.transaction((tx) => fn(tx));
}
