import 'dotenv/config';
import { Sequelize } from 'sequelize';
import { DB_TIMEOUTS } from '../db/timeouts';

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
