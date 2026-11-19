import { pool, query } from './sql';
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

/** The content's stored counters, or undefined when the row is gone. */
export async function contentCounters(contentId: number) {
  const [row] = await query<{ comment_num: number; like_num: number }>(
    'SELECT comment_num, like_num FROM tb_content WHERE content_id = $1',
    [contentId],
  );
  return row;
}

/** The content's stored row, or undefined when it is gone for good. */
export async function contentState(contentId: number) {
  const [row] = await query<{
    type: string;
    author_id: number;
    board_id: string;
    category_id: string | null;
    title: string | null;
    text: string | null;
    view_num: number;
    comment_num: number;
    like_num: number;
    updated_at: Date;
    deleted_at: Date | null;
  }>(
    `SELECT type, author_id, board_id, category_id, title, text, view_num,
            comment_num, like_num, updated_at, deleted_at
       FROM tb_content WHERE content_id = $1`,
    [contentId],
  );
  return row;
}

/** Whether the content has its `tb_post` detail row. */
export async function hasPostRow(contentId: number) {
  const rows = await query('SELECT 1 FROM tb_post WHERE content_id = $1', [
    contentId,
  ]);
  return rows.length > 0;
}

/** The comment's text and whether it is soft-deleted. */
export async function commentState(commentId: number) {
  const [row] = await query<{ text: string; deleted_at: Date | null }>(
    'SELECT text, deleted_at FROM tb_comment WHERE comment_id = $1',
    [commentId],
  );
  return row && { text: row.text, deleted: row.deleted_at !== null };
}

/** Counts the content's comments, soft-deleted ones included. */
export async function countComments(contentId: number) {
  const [row] = await query<{ count: string }>(
    'SELECT count(*) FROM tb_comment WHERE parent_id = $1',
    [contentId],
  );
  return Number(row.count);
}

/** Whether a `tb_content_like` row exists for the pair. */
export async function hasContentLike(
  user: Pick<User, 'user_id'>,
  contentId: number,
) {
  const rows = await query(
    'SELECT 1 FROM tb_content_like WHERE content_id = $1 AND user_id = $2',
    [contentId, user.user_id],
  );
  return rows.length > 0;
}

/** Whether a `tb_comment_like` row exists for the pair. */
export async function hasCommentLike(
  user: Pick<User, 'user_id'>,
  commentId: number,
) {
  const rows = await query(
    'SELECT 1 FROM tb_comment_like WHERE comment_id = $1 AND user_id = $2',
    [commentId, user.user_id],
  );
  return rows.length > 0;
}

/**
 * Runs `fn` while every `operation` on the table raises an error, through a
 * trigger, so a request that writes there fails halfway, whatever ORM runs
 * it. Tests use it to check that the earlier writes of the request are rolled
 * back. The trigger is dropped afterwards.
 */
export async function withFailingWrites<T>(
  table: string,
  operation: 'INSERT' | 'UPDATE' | 'DELETE',
  fn: () => PromiseLike<T>,
) {
  await query(`
    CREATE OR REPLACE FUNCTION test_fail_write() RETURNS trigger AS $$
    BEGIN
      RAISE EXCEPTION 'write to % blocked by the test', TG_TABLE_NAME;
    END;
    $$ LANGUAGE plpgsql
  `);
  await query(
    `CREATE TRIGGER test_fail_write BEFORE ${operation} ON public.${table} ` +
      'FOR EACH ROW EXECUTE FUNCTION test_fail_write()',
  );
  try {
    return await fn();
  } finally {
    await query(`DROP TRIGGER test_fail_write ON public.${table}`);
  }
}

/**
 * Runs `fn` while another connection holds `SELECT ... FOR UPDATE` on the
 * rows matching `where`, as a slow concurrent request would. The lock is
 * released afterwards.
 */
export async function withRowsLocked<T>(
  table: string,
  where: Record<string, unknown>,
  fn: () => PromiseLike<T>,
) {
  const client = await pool.connect();
  const conditions = Object.keys(where).map(
    (column, index) => `"${column}" = $${index + 1}`,
  );
  try {
    await client.query('BEGIN');
    await client.query(
      `SELECT 1 FROM public.${table} WHERE ${conditions.join(' AND ')} ` +
        'FOR UPDATE',
      Object.values(where),
    );
    return await fn();
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
}
