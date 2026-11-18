import { withTransaction, type Tx } from '../db/transaction';
import { NotFoundError } from '../errors';
import * as comments from '../controllers/comment.controller';
import * as commentLikes from '../controllers/commentLike.controller';
import { addToContentCounter } from '../controllers/content.controller';
import { assertCanEdit } from './permissions';
import type { Actor } from './types';

type CommentInput = { text?: string; parent_comment_id?: number | null };

/** Adds a comment to the content and counts it in `comment_num`. */
export function createComment(
  actor: Actor,
  contentId: string,
  input: CommentInput,
) {
  return withTransaction(async (tx) => {
    const commentId = await comments.createComment(
      actor._id,
      contentId,
      input,
      tx,
    );
    await addToContentCounter(contentId, 'comment_num', 1, tx);
    return commentId;
  });
}

/**
 * Loads the comment and checks that the actor may change it. Throws 404 for
 * an unknown comment and 403 when the actor is neither its author nor within
 * the board's edit level.
 */
async function loadEditableComment(actor: Actor, commentId: string, tx?: Tx) {
  const comment = await comments.retrieveCommentForEdit(commentId, tx);
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }
  assertCanEdit(actor, comment);
  return comment;
}

export async function updateComment(
  actor: Actor,
  commentId: string,
  input: CommentInput,
) {
  await loadEditableComment(actor, commentId);
  await comments.updateComment(commentId, input);
}

/**
 * Soft-deletes the comment and uncounts it from its content. When two
 * deletes race, the second waits on the row lock the first one's delete
 * takes, deletes nothing, and so leaves the count alone.
 */
export function deleteComment(actor: Actor, commentId: string) {
  return withTransaction(async (tx) => {
    const comment = await loadEditableComment(actor, commentId, tx);
    const deleted = await comments.deleteComment(commentId, tx);
    if (deleted > 0) {
      await addToContentCounter(comment.parent_id, 'comment_num', -1, tx);
    }
  });
}

/**
 * Likes the comment, or takes the like back if the actor already likes it.
 * The comment's row is locked first, so two toggles at once run one after
 * the other instead of both inserting.
 */
export function toggleCommentLike(actor: Actor, commentId: string) {
  return withTransaction(async (tx) => {
    await comments.lockComment(commentId, tx);
    const liked = await commentLikes.checkCommentLike(commentId, actor._id, tx);
    if (liked) {
      await commentLikes.dislikeComment(commentId, actor._id, tx);
    } else {
      await commentLikes.likeComment(commentId, actor._id, tx);
    }
  });
}
