import 'dotenv/config';
import { Sequelize } from 'sequelize';

/** Milliseconds from the env var, or the default when unset or invalid. */
function msFromEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

/**
 * Safety nets so a stuck query or transaction ends in an error (a 500)
 * instead of hanging a request and its pooled connection forever. For
 * example, a query inside `withTransaction` that is not passed `tx` runs on
 * another connection and waits on its own transaction's row lock, which
 * Postgres can't detect as a deadlock; `lock_timeout` ends it.
 */
export const DB_TIMEOUTS = {
  /** How long a statement waits for a row or table lock. */
  lock: msFromEnv('DB_LOCK_TIMEOUT_MS', 5_000),
  /** How long one statement may run. */
  statement: msFromEnv('DB_STATEMENT_TIMEOUT_MS', 30_000),
  /** How long a transaction may sit open between statements. */
  idleInTransaction: msFromEnv('DB_IDLE_IN_TRANSACTION_TIMEOUT_MS', 60_000),
  /** How long a request waits for a free pooled connection. */
  acquire: msFromEnv('DB_POOL_ACQUIRE_TIMEOUT_MS', 10_000),
};

const sequelize = (function () {
  const seq = new Sequelize(
    process.env.POSTGRESQL_DATABASE,
    process.env.POSTGRESQL_USERNAME,
    process.env.POSTGRESQL_PASSWORD,
    {
      host: process.env.DB_HOST ?? 'localhost',
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        lock_timeout: DB_TIMEOUTS.lock,
        statement_timeout: DB_TIMEOUTS.statement,
        idle_in_transaction_session_timeout: DB_TIMEOUTS.idleInTransaction,
      },
      pool: { acquire: DB_TIMEOUTS.acquire },
    },
  );

  seq
    .authenticate()
    .then(() => {
      // The schema is managed by migrations in `drizzle/` (see `db/migrate.ts`).
      console.log('Connected to PostgreSQL server');
    })
    .catch((e) => {
      console.log('Failed to connect to PostgreSQL server >> ', e);
    });

  return seq;
})();

export { sequelize };
