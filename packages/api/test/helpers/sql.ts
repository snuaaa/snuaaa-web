import { Pool } from 'pg';
import { testEnv } from '../env';

/**
 * A direct connection to the test database. Test helpers read and write
 * tables with SQL instead of the app's models, so they keep working when the
 * ORM changes (#158). The tables themselves come from the migrations.
 */
export const pool = new Pool({
  host: testEnv.DB_HOST,
  database: testEnv.POSTGRESQL_DATABASE,
  user: testEnv.POSTGRESQL_USERNAME,
  password: testEnv.POSTGRESQL_PASSWORD,
  max: 2,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

export async function query<T extends Row = Row>(
  text: string,
  params: unknown[] = [],
) {
  const result = await pool.query<T>(text, params);
  return result.rows;
}

/** Inserts one row and returns it as stored, with defaults filled in. */
export async function insert<T extends Row = Row>(table: string, row: Row) {
  const columns = Object.keys(row).map((c) => `"${c}"`);
  const values = columns.map((_, i) => `$${i + 1}`);
  const [inserted] = await query<T>(
    `INSERT INTO public.${table} (${columns.join(', ')}) ` +
      `VALUES (${values.join(', ')}) RETURNING *`,
    Object.values(row),
  );
  return inserted;
}
