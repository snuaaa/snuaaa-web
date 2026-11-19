import { and, eq, isNull } from 'drizzle-orm';
import { database, type Executor, type Transaction } from '../db/client';
import { board, comment, content } from '../db/schema';
import { parseId } from './utils';

/** Adds a comment and returns its id. */
export async function insert(
  values: {
    parent_id: number;
    author_id: number;
    text?: string | null;
    parent_comment_id?: number | null;
  },
  executor: Executor = database,
) {
  const now = new Date();
  const [row] = await executor
    .insert(comment)
    .values({
      parent_id: values.parent_id,
      author_id: values.author_id,
      text: values.text ?? null,
      parent_comment_id: values.parent_comment_id ?? null,
      created_at: now,
      updated_at: now,
    })
    .returning({ comment_id: comment.comment_id });
  return row.comment_id;
}

/** Changes the text. Returns how many (not deleted) rows it changed. */
export async function updateText(
  commentId: number,
  text: string | null | undefined,
  executor: Executor = database,
) {
  const rows = await executor
    .update(comment)
    .set({ text: text ?? null, updated_at: new Date() })
    .where(and(eq(comment.comment_id, commentId), isNull(comment.deleted_at)))
    .returning({ comment_id: comment.comment_id });
  return rows.length;
}

/**
 * Soft-deletes the comment. Returns how many rows it deleted: 0 when another
 * request deleted it first.
 */
export async function softDelete(
  commentId: number,
  executor: Executor = database,
) {
  const rows = await executor
    .update(comment)
    .set({ deleted_at: new Date() })
    .where(and(eq(comment.comment_id, commentId), isNull(comment.deleted_at)))
    .returning({ comment_id: comment.comment_id });
  return rows.length;
}

/**
 * What deciding who may edit the comment needs: its author, the content it
 * is on, and the edit level of that content's board. Null when the comment
 * doesn't exist or is deleted.
 */
export async function findForEdit(
  commentId: string,
  executor: Executor = database,
) {
  const id = parseId(commentId);
  if (id === null) {
    return null;
  }
  const [row] = await executor
    .select({
      comment_id: comment.comment_id,
      author_id: comment.author_id,
      parent_id: comment.parent_id,
      lv_edit: board.lv_edit,
    })
    .from(comment)
    .leftJoin(content, eq(content.content_id, comment.parent_id))
    .leftJoin(board, eq(board.board_id, content.board_id))
    .where(and(eq(comment.comment_id, id), isNull(comment.deleted_at)));
  return row ?? null;
}

/**
 * Locks the comment's row until `transaction` ends, so like toggles on the
 * same comment run one after another. Returns the id of the content it
 * belongs to, or null for an unknown comment (deleted ones included).
 */
export async function lock(
  commentId: string | number,
  transaction: Transaction,
) {
  const id = parseId(commentId);
  if (id === null) {
    return null;
  }
  const [row] = await transaction
    .select({ parent_id: comment.parent_id })
    .from(comment)
    .where(eq(comment.comment_id, id))
    .for('update');
  return row?.parent_id ?? null;
}

/**
 * The id of the content the comment belongs to, or null for an unknown
 * comment (deleted ones included, so a reply to a deleted comment still
 * works).
 */
export async function findContentId(
  commentId: number,
  executor: Executor = database,
) {
  const [row] = await executor
    .select({ parent_id: comment.parent_id })
    .from(comment)
    .where(eq(comment.comment_id, commentId));
  return row?.parent_id ?? null;
}
