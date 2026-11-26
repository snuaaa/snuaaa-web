import { and, count, desc, eq, gte, inArray, isNull } from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { board, content, document, post, user } from '../db/schema';
import ContentTypeEnum from '../enums/contentTypeEnum';
import { contentJson, searchCondition } from './content.repository';
import { authorJson } from './user.repository';
import { parseId } from './utils';

/** Adds the `tb_post` detail row of a content. */
export async function insert(contentId: number, executor: Executor = database) {
  await executor.insert(post).values({ content_id: contentId });
}

/**
 * The (not deleted) post with its author and board, or null. A content
 * counts as a post when it has a `tb_post` row. Its author shows even after
 * leaving the club.
 */
export async function findDetail(
  postId: string | number,
  executor: Executor = database,
) {
  const id = parseId(postId);
  if (id === null) {
    return null;
  }
  const [row] = await executor
    .select({
      ...contentJson,
      post: { content_id: post.content_id },
      user: authorJson,
      board: {
        board_id: board.board_id,
        board_name: board.board_name,
        lv_read: board.lv_read,
      },
    })
    .from(content)
    .innerJoin(post, eq(post.content_id, content.content_id))
    .innerJoin(user, eq(user.user_id, content.author_id))
    .innerJoin(board, eq(board.board_id, content.board_id))
    .where(and(eq(content.content_id, id), isNull(content.deleted_at)));
  return row ?? null;
}

export type PostFilter = {
  /** Only boards whose read level allows this grade. */
  readGrade: number;
  boardId?: string;
  authorId?: number;
  /** 'title', 'text', 'all' (title or text) or 'user' (nickname). */
  searchType?: string;
  searchKeyword?: string;
};

function listWhere(filter: PostFilter) {
  return and(
    eq(content.type, ContentTypeEnum.POST),
    isNull(content.deleted_at),
    gte(board.lv_read, filter.readGrade),
    filter.boardId ? eq(content.board_id, filter.boardId) : undefined,
    filter.authorId !== undefined
      ? eq(content.author_id, filter.authorId)
      : undefined,
    searchCondition(filter.searchType, filter.searchKeyword),
  );
}

/**
 * The matching (not deleted) posts, newest first, with their author and
 * board. `post` is null for a PO content without its `tb_post` row.
 */
export async function list(
  filter: PostFilter,
  page: { limit: number; offset: number },
  executor: Executor = database,
) {
  return executor
    .select({
      ...contentJson,
      post: { content_id: post.content_id },
      user: {
        nickname: user.nickname,
        profile_path: user.profile_path,
        profile_url: user.profile_url,
      },
      board: { board_id: board.board_id, board_name: board.board_name },
    })
    .from(content)
    .leftJoin(post, eq(post.content_id, content.content_id))
    .innerJoin(user, eq(user.user_id, content.author_id))
    .innerJoin(board, eq(board.board_id, content.board_id))
    .where(listWhere(filter))
    .orderBy(desc(content.created_at), desc(content.content_id))
    .limit(page.limit)
    .offset(page.offset);
}

/** How many posts `list` finds without its page. */
export async function countList(
  filter: PostFilter,
  executor: Executor = database,
) {
  const [row] = await executor
    .select({ count: count() })
    .from(content)
    .innerJoin(user, eq(user.user_id, content.author_id))
    .innerJoin(board, eq(board.board_id, content.board_id))
    .where(listWhere(filter));
  return row.count;
}

/**
 * The board's most recently updated (not deleted) post, with just its
 * title and text (the home page's notice box), or null.
 */
export async function findLatestUpdatedOnBoard(
  boardId: string,
  executor: Executor = database,
) {
  const [row] = await executor
    .select({
      content_id: content.content_id,
      title: content.title,
      text: content.text,
      post: { content_id: post.content_id },
    })
    .from(content)
    .innerJoin(post, eq(post.content_id, content.content_id))
    .where(and(eq(content.board_id, boardId), isNull(content.deleted_at)))
    .orderBy(desc(content.updated_at), desc(content.content_id))
    .limit(1);
  return row ?? null;
}

/**
 * The most recently updated (not deleted) posts and documents on the boards
 * whose read level allows the grade, with their board. `post` or `document`
 * is null when the content has no such detail row.
 */
export async function listRecentlyUpdatedWithDocuments(
  readGrade: number,
  limit: number,
  executor: Executor = database,
) {
  return executor
    .select({
      ...contentJson,
      post: { content_id: post.content_id },
      document: {
        content_id: document.content_id,
        generation: document.generation,
      },
      board: { board_id: board.board_id, board_name: board.board_name },
    })
    .from(content)
    .leftJoin(post, eq(post.content_id, content.content_id))
    .leftJoin(document, eq(document.content_id, content.content_id))
    .innerJoin(board, eq(board.board_id, content.board_id))
    .where(
      and(
        inArray(content.type, [ContentTypeEnum.POST, ContentTypeEnum.DOCUMENT]),
        isNull(content.deleted_at),
        gte(board.lv_read, readGrade),
      ),
    )
    .orderBy(desc(content.updated_at), desc(content.content_id))
    .limit(limit);
}

function recentlyUpdatedWhere(readGrade: number) {
  return and(isNull(content.deleted_at), gte(board.lv_read, readGrade));
}

/**
 * The (not deleted) posts on the boards whose read level allows the grade,
 * most recently updated first, with their author and board. Only contents
 * with a `tb_post` row count.
 */
export async function listRecentlyUpdated(
  readGrade: number,
  page: { limit: number; offset: number },
  executor: Executor = database,
) {
  return executor
    .select({
      ...contentJson,
      post: { content_id: post.content_id },
      board: { board_id: board.board_id, board_name: board.board_name },
      user: {
        nickname: user.nickname,
        profile_path: user.profile_path,
        profile_url: user.profile_url,
      },
    })
    .from(content)
    .innerJoin(post, eq(post.content_id, content.content_id))
    .innerJoin(board, eq(board.board_id, content.board_id))
    .innerJoin(user, eq(user.user_id, content.author_id))
    .where(recentlyUpdatedWhere(readGrade))
    .orderBy(desc(content.updated_at), desc(content.content_id))
    .limit(page.limit)
    .offset(page.offset);
}

/** How many posts `listRecentlyUpdated` finds without its page. */
export async function countRecentlyUpdated(
  readGrade: number,
  executor: Executor = database,
) {
  const [row] = await executor
    .select({ count: count() })
    .from(content)
    .innerJoin(post, eq(post.content_id, content.content_id))
    .innerJoin(board, eq(board.board_id, content.board_id))
    .innerJoin(user, eq(user.user_id, content.author_id))
    .where(recentlyUpdatedWhere(readGrade));
  return row.count;
}
