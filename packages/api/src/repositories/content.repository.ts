import { randomUUID } from 'crypto';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { database, type Executor, type Transaction } from '../db/client';
import { board, content } from '../db/schema';
import { parseId } from './utils';

export type ContentFields = {
  title?: string | null;
  text?: string | null;
  category_id?: string | null;
};

/** Adds a content row and returns its id. */
export async function insert(
  values: ContentFields & {
    author_id: number;
    board_id: string;
    type: string;
    /** The parent content, e.g. a photo's album. */
    parent_id?: number | null;
  },
  executor: Executor = database,
) {
  const now = new Date();
  const [row] = await executor
    .insert(content)
    .values({
      content_uuid: randomUUID(),
      author_id: values.author_id,
      board_id: values.board_id,
      category_id: values.category_id ?? null,
      title: values.title ?? null,
      text: values.text ?? null,
      type: values.type,
      parent_id: values.parent_id ?? null,
      created_at: now,
      updated_at: now,
    })
    .returning({ content_id: content.content_id });
  return row.content_id;
}

/**
 * The content's columns in the shape the read endpoints answer, the one
 * Sequelize used: timestamps in camelCase, which the web reads.
 */
export const contentJson = {
  content_id: content.content_id,
  content_uuid: content.content_uuid,
  author_id: content.author_id,
  board_id: content.board_id,
  category_id: content.category_id,
  type: content.type,
  parent_id: content.parent_id,
  title: content.title,
  text: content.text,
  view_num: content.view_num,
  comment_num: content.comment_num,
  like_num: content.like_num,
  createdAt: content.created_at,
  updatedAt: content.updated_at,
  deletedAt: content.deleted_at,
};

const withBoard = {
  content_id: content.content_id,
  type: content.type,
  author_id: content.author_id,
  board_id: content.board_id,
  lv_read: board.lv_read,
  lv_edit: board.lv_edit,
};

/**
 * The (not deleted) content with its board's read and edit levels, or null.
 * The levels are null when the content has no board.
 */
export async function findWithBoard(
  contentId: string | number,
  executor: Executor = database,
) {
  const id = parseId(contentId);
  if (id === null) {
    return null;
  }
  const [row] = await executor
    .select(withBoard)
    .from(content)
    .leftJoin(board, eq(board.board_id, content.board_id))
    .where(and(eq(content.content_id, id), isNull(content.deleted_at)));
  return row ?? null;
}

/**
 * Locks the content's row until `transaction` ends, so requests that change
 * the same content (e.g. like toggles) run one after another. Returns the
 * content like `findWithBoard`, or null when it doesn't exist or is deleted.
 */
export async function lock(
  contentId: string | number,
  transaction: Transaction,
) {
  const id = parseId(contentId);
  if (id === null) {
    return null;
  }
  const [row] = await transaction
    .select(withBoard)
    .from(content)
    .leftJoin(board, eq(board.board_id, content.board_id))
    .where(and(eq(content.content_id, id), isNull(content.deleted_at)))
    .for('update', { of: content });
  return row ?? null;
}

/**
 * Changes the fields that are given (undefined ones stay as they are).
 * Returns how many (not deleted) rows it changed.
 */
export async function update(
  contentId: number,
  fields: ContentFields,
  executor: Executor = database,
) {
  const rows = await executor
    .update(content)
    .set({
      title: fields.title,
      text: fields.text,
      category_id: fields.category_id,
      updated_at: new Date(),
    })
    .where(and(eq(content.content_id, contentId), isNull(content.deleted_at)))
    .returning({ content_id: content.content_id });
  return rows.length;
}

/**
 * Soft-deletes the content. Returns how many rows it deleted: 0 when another
 * request deleted it first.
 */
export async function softDelete(
  contentId: number,
  executor: Executor = database,
) {
  const rows = await executor
    .update(content)
    .set({ deleted_at: new Date() })
    .where(and(eq(content.content_id, contentId), isNull(content.deleted_at)))
    .returning({ content_id: content.content_id });
  return rows.length;
}

/**
 * Adds `by` (negative to subtract) to one of the content's counters, without
 * touching `updated_at`.
 */
export async function addToCounter(
  contentId: number,
  counter: 'comment_num' | 'like_num' | 'view_num',
  by: number,
  executor: Executor = database,
) {
  await executor
    .update(content)
    .set({ [counter]: sql`coalesce(${content[counter]}, 0) + ${by}` })
    .where(eq(content.content_id, contentId));
}
