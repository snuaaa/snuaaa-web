import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = (function () {
  const seq = new Sequelize(
    process.env.POSTGRESQL_DATABASE,
    process.env.POSTGRESQL_USERNAME,
    process.env.POSTGRESQL_PASSWORD,
    {
      host: process.env.DB_HOST ?? 'localhost',
      dialect: 'postgres',
      logging: false,
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
