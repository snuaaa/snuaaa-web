import { and, count, desc, eq, gte, isNull } from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { board, category, content, document, user } from '../db/schema';
import { contentJson } from './content.repository';
import { authorJson } from './user.repository';
import { parseId } from './utils';

/** Adds the `tb_document` detail row of a content. */
export async function insert(
  contentId: number,
  generation: number | null,
  executor: Executor = database,
) {
  await executor.insert(document).values({ content_id: contentId, generation });
}

/**
 * Removes the `tb_document` row. Deleting a document has always removed this
 * row for good while only soft-deleting its content.
 */
export async function remove(contentId: number, executor: Executor = database) {
  await executor.delete(document).where(eq(document.content_id, contentId));
}

/**
 * The (not deleted) document with its author and board, or null. A content
 * counts as a document when it has a `tb_document` row. Its author shows
 * even after leaving the club.
 */
export async function findDetail(
  documentId: string | number,
  executor: Executor = database,
) {
  const id = parseId(documentId);
  if (id === null) {
    return null;
  }
  const [row] = await executor
    .select({
      ...contentJson,
      document: {
        content_id: document.content_id,
        generation: document.generation,
      },
      user: authorJson,
      board: {
        board_id: board.board_id,
        board_name: board.board_name,
        lv_read: board.lv_read,
      },
    })
    .from(content)
    .innerJoin(document, eq(document.content_id, content.content_id))
    .innerJoin(user, eq(user.user_id, content.author_id))
    .innerJoin(board, eq(board.board_id, content.board_id))
    .where(and(eq(content.content_id, id), isNull(content.deleted_at)));
  return row ?? null;
}

export type DocumentFilter = {
  /** Only boards whose read level allows this grade. */
  readGrade: number;
  categoryId?: string;
  generation?: number;
};

function listWhere(filter: DocumentFilter) {
  return and(
    isNull(content.deleted_at),
    gte(board.lv_read, filter.readGrade),
    filter.categoryId ? eq(content.category_id, filter.categoryId) : undefined,
    filter.generation !== undefined
      ? eq(document.generation, filter.generation)
      : undefined,
  );
}

/**
 * The matching (not deleted) documents, last updated first. Documents
 * without a category are left out, as they always were.
 */
export async function list(
  filter: DocumentFilter,
  page: { limit: number; offset: number },
  executor: Executor = database,
) {
  const rows = await executor
    .select({
      content_id: document.content_id,
      generation: document.generation,
      title: content.title,
      text: content.text,
      nickname: user.nickname,
      deleted_at: user.deleted_at,
      category_name: category.category_name,
    })
    .from(document)
    .innerJoin(content, eq(content.content_id, document.content_id))
    .innerJoin(user, eq(user.user_id, content.author_id))
    .innerJoin(category, eq(category.category_id, content.category_id))
    .innerJoin(board, eq(board.board_id, content.board_id))
    .where(listWhere(filter))
    .orderBy(desc(content.updated_at), desc(content.content_id))
    .limit(page.limit)
    .offset(page.offset);
  return rows.map((row) => ({
    content_id: row.content_id,
    generation: row.generation,
    content: {
      content_id: row.content_id,
      title: row.title,
      text: row.text,
      user: { nickname: row.nickname, deleted_at: row.deleted_at },
      category: { category_name: row.category_name },
    },
  }));
}

/** How many documents `list` finds without its page. */
export async function countList(
  filter: DocumentFilter,
  executor: Executor = database,
) {
  const [row] = await executor
    .select({ count: count() })
    .from(document)
    .innerJoin(content, eq(content.content_id, document.content_id))
    .innerJoin(user, eq(user.user_id, content.author_id))
    .innerJoin(category, eq(category.category_id, content.category_id))
    .innerJoin(board, eq(board.board_id, content.board_id))
    .where(listWhere(filter));
  return row.count;
}
