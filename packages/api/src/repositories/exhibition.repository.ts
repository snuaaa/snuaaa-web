import { and, desc, eq, isNull } from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { board, content, exhibition, user } from '../db/schema';
import { contentJson } from './content.repository';
import { authorJson } from './user.repository';
import { parseId } from './utils';

/** The details an exhibition stores next to its content row. */
export type ExhibitionFields = {
  exhibition_no?: number | null;
  slogan?: string | null;
  date_start?: Date | null;
  date_end?: Date | null;
  place?: string | null;
};

/** The poster's S3 URLs, original and thumbnail. */
export type PosterUrls = { url: string; thumbnailUrl: string };

/** The poster columns, with the legacy path columns holding the same URLs. */
function posterColumns(poster: PosterUrls) {
  return {
    poster_path: poster.url,
    poster_thumbnail_path: poster.thumbnailUrl,
    poster_url: poster.url,
    poster_thumbnail_url: poster.thumbnailUrl,
  };
}

/** Adds the `tb_exhibition` detail row of a content. */
export async function insert(
  contentId: number,
  fields: ExhibitionFields,
  poster: PosterUrls,
  executor: Executor = database,
) {
  await executor.insert(exhibition).values({
    content_id: contentId,
    exhibition_no: fields.exhibition_no ?? null,
    slogan: fields.slogan ?? null,
    date_start: fields.date_start ?? null,
    date_end: fields.date_end ?? null,
    place: fields.place ?? null,
    ...posterColumns(poster),
  });
}

/**
 * Changes the details that are given (undefined ones stay), and the poster
 * when a new one is given.
 */
export async function update(
  contentId: number,
  fields: ExhibitionFields,
  poster?: PosterUrls,
  executor: Executor = database,
) {
  const values = {
    ...Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value !== undefined),
    ),
    ...(poster ? posterColumns(poster) : {}),
  };
  if (Object.keys(values).length === 0) {
    return;
  }
  await executor
    .update(exhibition)
    .set(values)
    .where(eq(exhibition.content_id, contentId));
}

/** Every `tb_exhibition` column. */
export const exhibitionJson = {
  content_id: exhibition.content_id,
  exhibition_no: exhibition.exhibition_no,
  slogan: exhibition.slogan,
  date_start: exhibition.date_start,
  date_end: exhibition.date_end,
  place: exhibition.place,
  poster_path: exhibition.poster_path,
  poster_thumbnail_path: exhibition.poster_thumbnail_path,
  poster_url: exhibition.poster_url,
  poster_thumbnail_url: exhibition.poster_thumbnail_url,
};

/**
 * The (not deleted) exhibition with its details, author and board, or null.
 * A content counts as an exhibition when it has a `tb_exhibition` row. Its
 * author shows even after leaving the club.
 */
export async function findDetail(
  exhibitionId: string | number,
  executor: Executor = database,
) {
  const id = parseId(exhibitionId);
  if (id === null) {
    return null;
  }
  const [row] = await executor
    .select({
      ...contentJson,
      exhibition: exhibitionJson,
      user: authorJson,
      board: {
        board_id: board.board_id,
        board_name: board.board_name,
        lv_read: board.lv_read,
        lv_write: board.lv_write,
      },
    })
    .from(content)
    .innerJoin(exhibition, eq(exhibition.content_id, content.content_id))
    .innerJoin(user, eq(user.user_id, content.author_id))
    .innerJoin(board, eq(board.board_id, content.board_id))
    .where(and(eq(content.content_id, id), isNull(content.deleted_at)));
  return row ?? null;
}

/** The (not deleted) exhibition with its details, or null. */
export async function find(
  exhibitionId: number,
  executor: Executor = database,
) {
  const [row] = await executor
    .select({ ...contentJson, exhibition: exhibitionJson })
    .from(content)
    .innerJoin(exhibition, eq(exhibition.content_id, content.content_id))
    .where(
      and(eq(content.content_id, exhibitionId), isNull(content.deleted_at)),
    );
  return row ?? null;
}

/**
 * Every (not deleted) exhibition, on any board, newest number first, with
 * its details, author and board.
 */
export async function list(executor: Executor = database) {
  return executor
    .select({
      ...contentJson,
      exhibition: exhibitionJson,
      user: authorJson,
      board: {
        board_id: board.board_id,
        board_name: board.board_name,
        lv_read: board.lv_read,
      },
    })
    .from(content)
    .innerJoin(exhibition, eq(exhibition.content_id, content.content_id))
    .innerJoin(user, eq(user.user_id, content.author_id))
    .innerJoin(board, eq(board.board_id, content.board_id))
    .where(isNull(content.deleted_at))
    .orderBy(desc(exhibition.exhibition_no), desc(content.content_id));
}
