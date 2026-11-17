import { query } from './sql';
import type { User } from './factories';

/*
 * Reads and changes to the test database that tests need beyond the
 * factories. Test files call these instead of writing SQL, so the SQL (and
 * the table layout it depends on) stays in `test/helpers/`.
 */

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

/** The user's grade as stored now. */
export async function gradeOf(user: Pick<User, 'user_id'>) {
  const [row] = await query<{ grade: number }>(
    'SELECT grade FROM tb_user WHERE user_id = $1',
    [user.user_id],
  );
  return row.grade;
}

/** Removes the user's row, as if the account were gone for good. */
export async function deleteUser(user: Pick<User, 'user_id'>) {
  await query('DELETE FROM tb_user WHERE user_id = $1', [user.user_id]);
}

/** Counts `tb_content` rows matching every given column, deleted ones included. */
export async function countContents(where: {
  board_id?: string;
  type?: string;
  parent_id?: number;
}) {
  const conditions = Object.keys(where).map((c, i) => `"${c}" = $${i + 1}`);
  const [row] = await query<{ count: string }>(
    'SELECT count(*) FROM tb_content' +
      (conditions.length ? ` WHERE ${conditions.join(' AND ')}` : ''),
    Object.values(where),
  );
  return Number(row.count);
}

/**
 * Runs `fn` while the table is renamed, so any query on it fails the way a
 * broken DB would, whatever ORM runs it. The name is restored afterwards.
 */
export async function withTableMissing<T>(
  table: string,
  fn: () => PromiseLike<T>,
) {
  await query(`ALTER TABLE public.${table} RENAME TO ${table}_missing`);
  try {
    return await fn();
  } finally {
    await query(`ALTER TABLE public.${table}_missing RENAME TO ${table}`);
  }
}
