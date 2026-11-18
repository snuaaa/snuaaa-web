import { withTransaction, type Tx } from '../db/transaction';
import { NotFoundError } from '../errors';
import * as comments from '../repositories/comment.repository';
import * as contents from '../repositories/content.repository';
import * as likes from '../repositories/like.repository';
import { assertCanEdit } from './permissions';
import type { Actor } from './types';

export type CommentInput = {
  text?: string | null;
  parent_comment_id?: number | null;
};

/**
 * Adds a comment to the content and counts it in `comment_num`. The content
 * row is locked first, which also checks that it exists (404 otherwise).
 */
export function createComment(
  actor: Actor,
  contentId: string,
  input: CommentInput,
) {
  return withTransaction(async (tx) => {
    if (!(await contents.lock(contentId, tx))) {
      throw new NotFoundError('Content not found');
    }
    const id = Number(contentId);
    const commentId = await comments.insert(
      {
        parent_id: id,
        author_id: actor._id,
        text: input.text,
        parent_comment_id: input.parent_comment_id,
      },
      tx,
    );
    await contents.addToCounter(id, 'comment_num', 1, tx);
    return commentId;
  });
}

/**
 * Loads the comment and checks that the actor may change it. Throws 404 for
 * an unknown or deleted comment and 403 when the actor is neither its author
 * nor within the board's edit level.
 */
async function loadEditableComment(actor: Actor, commentId: string, tx?: Tx) {
  const comment = await comments.findForEdit(commentId, tx);
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }
  assertCanEdit(actor, comment);
  return comment;
}

/** Changes the text. 404 when the comment is deleted before the change. */
export async function updateComment(
  actor: Actor,
  commentId: string,
  input: CommentInput,
) {
  const comment = await loadEditableComment(actor, commentId);
  if ((await comments.updateText(comment.comment_id, input.text)) === 0) {
    throw new NotFoundError('Comment not found');
  }
}

/**
 * Soft-deletes the comment and uncounts it from its content. When two
 * deletes race, the second waits on the row lock the first one's delete
 * takes, deletes nothing, and so leaves the count alone.
 */
export function deleteComment(actor: Actor, commentId: string) {
  return withTransaction(async (tx) => {
    const comment = await loadEditableComment(actor, commentId, tx);
    if ((await comments.softDelete(comment.comment_id, tx)) > 0) {
      await contents.addToCounter(comment.parent_id, 'comment_num', -1, tx);
    }
  });
}

/**
 * Likes the comment, or takes the like back if the actor already likes it.
 * The comment's row is locked first, so two toggles at once run one after
 * the other instead of both inserting. 404 for an unknown comment.
 */
export function toggleCommentLike(actor: Actor, commentId: string) {
  return withTransaction(async (tx) => {
    if (!(await comments.lock(commentId, tx))) {
      throw new NotFoundError('Comment not found');
    }
    const id = Number(commentId);
    if (await likes.hasCommentLike(id, actor._id, tx)) {
      await likes.deleteCommentLike(id, actor._id, tx);
    } else {
      await likes.insertCommentLike(id, actor._id, tx);
    }
  });
}
