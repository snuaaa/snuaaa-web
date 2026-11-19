import 'dotenv/config';

/** Milliseconds from the env var, or the default when unset or invalid. */
function millisecondsFromEnvironment(name: string, fallback: number): number;
function millisecondsFromEnvironment(
  name: string,
  fallback?: number,
): number | undefined;
function millisecondsFromEnvironment(name: string, fallback?: number) {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

/**
 * Safety nets so a stuck query or transaction ends in an error (a 500)
 * instead of hanging a request and its pooled connection forever. For
 * example, a query inside `withTransaction` that is not passed `transaction` runs on
 * another connection and waits on its own transaction's row lock, which
 * Postgres can't detect as a deadlock; `lock_timeout` ends it.
 *
 * Both the Sequelize and the Drizzle connection pools use these.
 */
export const DATABASE_TIMEOUTS = {
  /** How long a statement waits for a row or table lock. */
  lock: millisecondsFromEnvironment(
    'DATABASE_LOCK_TIMEOUT_MILLISECONDS',
    5_000,
  ),
  /** How long one statement may run. */
  statement: millisecondsFromEnvironment(
    'DATABASE_STATEMENT_TIMEOUT_MILLISECONDS',
    30_000,
  ),
  /**
   * How long a transaction may sit open between statements. Off unless the
   * env var is set: `idle_in_transaction_session_timeout` exists only from
   * PostgreSQL 9.6, and an older server refuses every connection that sends
   * it. When unset, the pg driver doesn't send it.
   */
  idleInTransaction: millisecondsFromEnvironment(
    'DATABASE_IDLE_IN_TRANSACTION_TIMEOUT_MILLISECONDS',
  ),
  /** How long a request waits for a free pooled connection. */
  acquire: millisecondsFromEnvironment(
    'DATABASE_POOL_ACQUIRE_TIMEOUT_MILLISECONDS',
    10_000,
  ),
};
