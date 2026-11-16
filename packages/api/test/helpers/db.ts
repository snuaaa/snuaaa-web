import { query } from './sql';

/** Empties every table, so each test starts from an empty database. */
export async function resetDb() {
  const tables = await query<{ tablename: string }>(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public'",
  );
  if (tables.length === 0) {
    return;
  }
  const names = tables.map((t) => `public."${t.tablename}"`).join(', ');
  await query(`TRUNCATE ${names} RESTART IDENTITY CASCADE`);
}
