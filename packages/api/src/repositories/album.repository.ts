import { and, count, desc, eq, isNull } from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { album, board, category, content, user } from '../db/schema';
import { contentJson, searchCondition } from './content.repository';
import { authorJson } from './user.repository';
import { parseId } from './utils';

/** Adds the `tb_album` detail row of a content. */
export async function insert(
  contentId: number,
  isPrivate: boolean | null,
  executor: Executor = database,
) {
  await executor
    .insert(album)
    .values({ content_id: contentId, is_private: isPrivate });
}

/** Changes `is_private` when it is given (undefined keeps it). */
export async function update(
  contentId: number,
  fields: { is_private?: boolean | null },
  executor: Executor = database,
) {
  if (fields.is_private === undefined) {
    return;
  }
  await executor
    .update(album)
    .set({ is_private: fields.is_private })
    .where(eq(album.content_id, contentId));
}

/** Makes the photo the album's cover. */
export async function setThumbnail(
  contentId: number,
  photoId: number,
  executor: Executor = database,
) {
  await executor
    .update(album)
    .set({ tn_photo_id: photoId })
    .where(eq(album.content_id, contentId));
}

const albumJson = {
  content_id: album.content_id,
  is_private: album.is_private,
  tn_photo_id: album.tn_photo_id,
};

/**
 * The (not deleted) album with its details, author and board, or null. A
 * content counts as an album when it has a `tb_album` row. Its author shows
 * even after leaving the club.
 */
export async function findDetail(
  albumId: string | number,
  executor: Executor = database,
) {
  const id = parseId(albumId);
  if (id === null) {
    return null;
  }
  const [row] = await executor
    .select({
      ...contentJson,
      album: albumJson,
      user: authorJson,
      board: {
        board_id: board.board_id,
        board_name: board.board_name,
        lv_read: board.lv_read,
      },
    })
    .from(content)
    .innerJoin(album, eq(album.content_id, content.content_id))
    .innerJoin(user, eq(user.user_id, content.author_id))
    .innerJoin(board, eq(board.board_id, content.board_id))
    .where(and(eq(content.content_id, id), isNull(content.deleted_at)));
  return row ?? null;
}

/**
 * The (not deleted) content a photo belongs to, with its `album` details
 * (null when it has none), or null.
 */
export async function findParent(
  contentId: number,
  executor: Executor = database,
) {
  const [row] = await executor
    .select({ ...contentJson, album: albumJson })
    .from(content)
    .leftJoin(album, eq(album.content_id, content.content_id))
    .where(and(eq(content.content_id, contentId), isNull(content.deleted_at)));
  return row ?? null;
}

export type AlbumFilter = {
  boardId: string;
  categoryId?: string;
  /** 'title', 'text', 'all' (title or text) or 'user' (nickname). */
  searchType?: string;
  searchKeyword?: string;
};

function listWhere(filter: AlbumFilter) {
  return and(
    eq(content.board_id, filter.boardId),
    isNull(content.deleted_at),
    filter.categoryId ? eq(content.category_id, filter.categoryId) : undefined,
    searchCondition(filter.searchType, filter.searchKeyword),
  );
}

/**
 * The board's matching (not deleted) albums, newest first, with their
 * details, author and category (null when they have none).
 */
export async function list(
  filter: AlbumFilter,
  page: { limit: number; offset: number },
  executor: Executor = database,
) {
  return executor
    .select({
      ...contentJson,
      album: albumJson,
      user: authorJson,
      category: {
        category_id: category.category_id,
        board_id: category.board_id,
        category_name: category.category_name,
        category_color: category.category_color,
      },
    })
    .from(content)
    .innerJoin(album, eq(album.content_id, content.content_id))
    .innerJoin(user, eq(user.user_id, content.author_id))
    .leftJoin(category, eq(category.category_id, content.category_id))
    .where(listWhere(filter))
    .orderBy(desc(content.created_at), desc(content.content_id))
    .limit(page.limit)
    .offset(page.offset);
}

/** How many albums `list` finds without its page. */
export async function countList(
  filter: AlbumFilter,
  executor: Executor = database,
) {
  const [row] = await executor
    .select({ count: count() })
    .from(content)
    .innerJoin(album, eq(album.content_id, content.content_id))
    .innerJoin(user, eq(user.user_id, content.author_id))
    .where(listWhere(filter));
  return row.count;
}
