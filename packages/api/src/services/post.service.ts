import { withTransaction } from '../db/transaction';
import ContentTypeEnum from '../enums/contentTypeEnum';
import { NotFoundError } from '../errors';
import * as contents from '../repositories/content.repository';
import * as posts from '../repositories/post.repository';
import { loadAccessibleBoard } from './board.service';
import { assertCanEdit } from './permissions';
import type { Actor } from './types';

export type PostInput = contents.ContentFields;

/**
 * Creates a post by the actor on the board, which they must be allowed to
 * write (404 for an unknown board, 403 otherwise). The content row and its
 * `tb_post` row are written together or not at all. Returns the content id.
 */
export async function createPost(
  actor: Actor,
  boardId: string,
  input: PostInput,
) {
  await loadAccessibleBoard(actor, boardId, 'write');
  return withTransaction(async (transaction) => {
    const contentId = await contents.insert(
      {
        author_id: actor._id,
        board_id: boardId,
        type: ContentTypeEnum.POST,
        title: input.title,
        text: input.text,
        category_id: input.category_id,
      },
      transaction,
    );
    await posts.insert(contentId, transaction);
    return contentId;
  });
}

/**
 * Loads the post and checks that the actor may change it. Throws 404 for an
 * unknown or deleted post, or a content of another type, and 403 when the
 * actor is neither its author nor within the board's edit level.
 */
async function loadEditablePost(actor: Actor, postId: string) {
  const post = await contents.findWithBoard(postId);
  if (!post || post.type !== ContentTypeEnum.POST) {
    throw new NotFoundError('Content not found');
  }
  assertCanEdit(actor, post);
  return post;
}

/**
 * Changes the fields the input gives. 404 when the post is deleted before the
 * change.
 */
export async function updatePost(
  actor: Actor,
  postId: string,
  input: PostInput,
) {
  const post = await loadEditablePost(actor, postId);
  if ((await contents.update(post.content_id, input)) === 0) {
    throw new NotFoundError('Content not found');
  }
}

/** Soft-deletes the post. 404 when another request deleted it first. */
export async function deletePost(actor: Actor, postId: string) {
  const post = await loadEditablePost(actor, postId);
  if ((await contents.softDelete(post.content_id)) === 0) {
    throw new NotFoundError('Content not found');
  }
}
