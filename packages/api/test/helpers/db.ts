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

/** Soft-deletes the user, like leaving the club (`DELETE /api/userinfo`). */
export async function softDeleteUser(user: Pick<User, 'user_id'>) {
  await query('UPDATE tb_user SET deleted_at = now() WHERE user_id = $1', [
    user.user_id,
  ]);
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

/** The content's `tb_document` row, or undefined when there is none. */
export async function documentRow(contentId: number) {
  const [row] = await query<{ generation: number | null }>(
    'SELECT generation FROM tb_document WHERE content_id = $1',
    [contentId],
  );
  return row;
}

/** The content's `tb_album` row, or undefined when there is none. */
export async function albumRow(contentId: number) {
  const [row] = await query<{
    is_private: boolean | null;
    tn_photo_id: number | null;
  }>('SELECT is_private, tn_photo_id FROM tb_album WHERE content_id = $1', [
    contentId,
  ]);
  return row;
}

/** The content's `tb_photo` row, or undefined when there is none. */
export async function photoRow(contentId: number) {
  const [row] = await query(
    `SELECT img_url, thumbnail_url, location, camera, lens, exposure_time,
            focal_length, f_stop, iso, date
       FROM tb_photo WHERE content_id = $1`,
    [contentId],
  );
  return row;
}

/** The content's `tb_exhibition` row, or undefined when there is none. */
export async function exhibitionRow(contentId: number) {
  const [row] = await query(
    `SELECT exhibition_no, slogan, date_start, date_end, place, poster_path,
            poster_thumbnail_path, poster_url, poster_thumbnail_url
       FROM tb_exhibition WHERE content_id = $1`,
    [contentId],
  );
  return row;
}

/** The content's `tb_exhibit_photo` row, or undefined when there is none. */
export async function exhibitPhotoRow(contentId: number) {
  const [row] = await query(
    `SELECT exhibition_id, "order", photographer_id, photographer_alt,
            file_path, thumbnail_path, img_url, thumbnail_url, location,
            camera, lens, exposure_time, focal_length, f_stop, iso, date
       FROM tb_exhibit_photo WHERE content_id = $1`,
    [contentId],
  );
  return row;
}

/** The board's contents, oldest first, deleted ones included. */
export async function boardContents(boardId: string) {
  return query<{
    content_id: number;
    content_uuid: string | null;
    type: string;
    author_id: number;
    title: string | null;
    text: string | null;
    category_id: string | null;
    deleted_at: Date | null;
  }>(
    `SELECT content_id, content_uuid, type, author_id, title, text,
            category_id, deleted_at
       FROM tb_content WHERE board_id = $1 ORDER BY content_id`,
    [boardId],
  );
}

/** The contents of the type in the parent, oldest first, deleted ones included. */
export async function childContents(parentId: number, type: string) {
  return query<{
    content_id: number;
    content_uuid: string | null;
    author_id: number;
    board_id: string;
    category_id: string | null;
    title: string | null;
    text: string | null;
    deleted_at: Date | null;
  }>(
    `SELECT content_id, content_uuid, author_id, board_id, category_id,
            title, text, deleted_at
       FROM tb_content WHERE type = $1 AND parent_id = $2
      ORDER BY content_id`,
    [type, parentId],
  );
}

/** The ids of the tags on the content, sorted. */
export async function contentTagIds(contentId: number) {
  const rows = await query<{ tag_id: string }>(
    'SELECT tag_id FROM tb_content_tag WHERE content_id = $1 ORDER BY tag_id',
    [contentId],
  );
  return rows.map((row) => row.tag_id);
}

/** The photo contents in the album, oldest first, deleted ones included. */
export async function photosInAlbum(albumId: number) {
  return query<{
    content_id: number;
    content_uuid: string | null;
    author_id: number;
    board_id: string;
    category_id: string | null;
    title: string | null;
    text: string | null;
    deleted_at: Date | null;
  }>(
    `SELECT content_id, content_uuid, author_id, board_id, category_id,
            title, text, deleted_at
       FROM tb_content WHERE type = 'PH' AND parent_id = $1
      ORDER BY content_id`,
    [albumId],
  );
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
