import { QueryTypes } from 'sequelize';
import { sequelize } from '../../src/models/sequelize';

/** Empties every table, so each test starts from an empty database. */
export async function resetDb() {
  const tables = await sequelize.query<{ tablename: string }>(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public'",
    { type: QueryTypes.SELECT },
  );
  if (tables.length === 0) {
    return;
  }
  const names = tables.map((t) => `public."${t.tablename}"`).join(', ');
  await sequelize.query(`TRUNCATE ${names} RESTART IDENTITY CASCADE`);
}
