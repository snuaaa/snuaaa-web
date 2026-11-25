import { and, asc, count, desc, eq, gte, inArray, isNull } from 'drizzle-orm';
import { database, type Executor, type Transaction } from '../db/client';
import { board, comment, commentLike, content, user } from '../db/schema';
import { contentJson } from './content.repository';
import { authorJson } from './user.repository';
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

/** A comment as the web reads it, with Sequelize's timestamp names. */
const commentJson = {
  comment_id: comment.comment_id,
  comment_uuid: comment.comment_uuid,
  parent_id: comment.parent_id,
  parent_comment_id: comment.parent_comment_id,
  author_id: comment.author_id,
  text: comment.text,
  like_num: comment.like_num,
  createdAt: comment.created_at,
  updatedAt: comment.updated_at,
  deletedAt: comment.deleted_at,
};

/**
 * The content's (not deleted) top-level comments, or the (not deleted)
 * replies to the given comments, oldest first, with their authors (shown
 * even after leaving the club).
 */
export async function listOnContent(
  where: { contentId: number } | { parentCommentIds: number[] },
  executor: Executor = database,
) {
  if ('parentCommentIds' in where && where.parentCommentIds.length === 0) {
    return [];
  }
  return executor
    .select({ ...commentJson, user: authorJson })
    .from(comment)
    .innerJoin(user, eq(user.user_id, comment.author_id))
    .where(
      and(
        isNull(comment.deleted_at),
        'contentId' in where
          ? and(
              eq(comment.parent_id, where.contentId),
              isNull(comment.parent_comment_id),
            )
          : inArray(comment.parent_comment_id, where.parentCommentIds),
      ),
    )
    .orderBy(asc(comment.created_at), asc(comment.comment_id));
}

/** Who likes each of the comments (shown even after leaving the club). */
export async function listLikers(
  commentIds: number[],
  executor: Executor = database,
) {
  if (commentIds.length === 0) {
    return [];
  }
  return executor
    .select({
      ...authorJson,
      commentLike: {
        comment_id: commentLike.comment_id,
        user_id: commentLike.user_id,
      },
    })
    .from(commentLike)
    .innerJoin(user, eq(user.user_id, commentLike.user_id))
    .where(inArray(commentLike.comment_id, commentIds))
    .orderBy(asc(commentLike.comment_id), asc(commentLike.user_id));
}

export type CommentFilter = {
  /** Only comments on (not deleted) contents of boards this grade may read. */
  readGrade: number;
  authorId?: number;
};

function listWhere(filter: CommentFilter) {
  return and(
    isNull(comment.deleted_at),
    isNull(content.deleted_at),
    gte(board.lv_read, filter.readGrade),
    filter.authorId === undefined
      ? undefined
      : eq(comment.author_id, filter.authorId),
  );
}

/**
 * A page of the matching comments, newest first, with their author and
 * content (with its board's name), and how many there are.
 */
export async function list(
  filter: CommentFilter,
  page: { limit: number; offset: number },
  executor: Executor = database,
) {
  const [rows, [total]] = await Promise.all([
    executor
      .select({
        ...commentJson,
        user: authorJson,
        content: contentJson,
        board: { board_id: board.board_id, board_name: board.board_name },
      })
      .from(comment)
      .innerJoin(user, eq(user.user_id, comment.author_id))
      .innerJoin(content, eq(content.content_id, comment.parent_id))
      .innerJoin(board, eq(board.board_id, content.board_id))
      .where(listWhere(filter))
      .orderBy(desc(comment.created_at), desc(comment.comment_id))
      .limit(page.limit)
      .offset(page.offset),
    executor
      .select({ count: count() })
      .from(comment)
      .innerJoin(user, eq(user.user_id, comment.author_id))
      .innerJoin(content, eq(content.content_id, comment.parent_id))
      .innerJoin(board, eq(board.board_id, content.board_id))
      .where(listWhere(filter)),
  ]);
  return {
    count: total.count,
    // The board is nested in the content, as Sequelize answered it.
    rows: rows.map(({ board: contentBoard, ...row }) => ({
      ...row,
      content: { ...row.content, board: contentBoard },
    })),
  };
}
