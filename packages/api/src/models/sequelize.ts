import 'dotenv/config';
import { Sequelize } from 'sequelize';
import { DATABASE_TIMEOUTS } from '../db/timeouts';

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
        lock_timeout: DATABASE_TIMEOUTS.lock,
        statement_timeout: DATABASE_TIMEOUTS.statement,
        idle_in_transaction_session_timeout:
          DATABASE_TIMEOUTS.idleInTransaction,
      },
      pool: { acquire: DATABASE_TIMEOUTS.acquire },
    },
  );

  seq
    .authenticate()
    .then(() => {
      // The schema is managed by migrations in `drizzle/` (see `db/migrate.ts`).
      console.log('Connected to PostgreSQL server');
    })
    .catch((error) => {
      console.log('Failed to connect to PostgreSQL server >> ', error);
    });

  return seq;
})();

export { sequelize };
