import { withTransaction } from '../db/transaction';
import ContentTypeEnum from '../enums/contentTypeEnum';
import { NotFoundError } from '../errors';
import * as contents from '../repositories/content.repository';
import * as posts from '../repositories/post.repository';
import { loadAccessibleBoard } from './board.service';
import * as users from '../repositories/user.repository';
import { loadEditableContent, readContent } from './content.service';
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
 * Changes the fields the input gives. 404 when the post is deleted before the
 * change.
 */
export async function updatePost(
  actor: Actor,
  postId: string,
  input: PostInput,
) {
  const post = await loadEditableContent(actor, postId, ContentTypeEnum.POST);
  if ((await contents.update(post.content_id, input)) === 0) {
    throw new NotFoundError('Content not found');
  }
}

/** Soft-deletes the post. 404 when another request deleted it first. */
export async function deletePost(actor: Actor, postId: string) {
  const post = await loadEditableContent(actor, postId, ContentTypeEnum.POST);
  if ((await contents.softDelete(post.content_id)) === 0) {
    throw new NotFoundError('Content not found');
  }
}

/**
 * The post with its author, board, files and whether the actor likes it,
 * counting the view. 404 for an unknown or deleted post, 403 above the
 * board's read level.
 */
export async function retrievePost(actor: Actor, postId: string) {
  const post = await posts.findDetail(postId);
  if (!post) {
    throw new NotFoundError('Post not found');
  }
  return readContent(actor, post);
}

export type PostListQuery = {
  boardId?: string;
  /** Only this member's posts; 404 when no such (current) member exists. */
  userUuid?: string;
  limit: number;
  offset: number;
  searchType?: string;
  searchKeyword?: string;
};

/**
 * A page of posts on the boards the actor may read, newest first, and how
 * many there are in all.
 */
export async function listPosts(actor: Actor, query: PostListQuery) {
  let authorId: number | undefined;
  if (query.userUuid) {
    const userId = await users.findIdByUuid(query.userUuid);
    if (userId === null) {
      throw new NotFoundError('User not found');
    }
    authorId = userId;
  }
  const filter: posts.PostFilter = {
    readGrade: actor.grade,
    boardId: query.boardId,
    authorId,
    searchType: query.searchType,
    searchKeyword: query.searchKeyword,
  };
  const [count, rows] = await Promise.all([
    posts.countList(filter),
    posts.list(filter, { limit: query.limit, offset: query.offset }),
  ]);
  return { count, rows };
}
