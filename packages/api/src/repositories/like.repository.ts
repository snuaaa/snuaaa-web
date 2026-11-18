import { and, eq } from 'drizzle-orm';
import { db, type Executor } from '../db/client';
import { commentLike, contentLike } from '../db/schema';

/*
 * Like rows only. Services keep `tb_content.like_num` in step with them.
 */

export async function hasContentLike(
  contentId: number,
  userId: number,
  ex: Executor = db,
) {
  const rows = await ex
    .select({ content_id: contentLike.content_id })
    .from(contentLike)
    .where(
      and(
        eq(contentLike.content_id, contentId),
        eq(contentLike.user_id, userId),
      ),
    );
  return rows.length > 0;
}

export async function insertContentLike(
  contentId: number,
  userId: number,
  ex: Executor = db,
) {
  await ex
    .insert(contentLike)
    .values({ content_id: contentId, user_id: userId });
}

/** Returns how many rows it removed. */
export async function deleteContentLike(
  contentId: number,
  userId: number,
  ex: Executor = db,
) {
  const rows = await ex
    .delete(contentLike)
    .where(
      and(
        eq(contentLike.content_id, contentId),
        eq(contentLike.user_id, userId),
      ),
    )
    .returning({ content_id: contentLike.content_id });
  return rows.length;
}

export async function hasCommentLike(
  commentId: number,
  userId: number,
  ex: Executor = db,
) {
  const rows = await ex
    .select({ comment_id: commentLike.comment_id })
    .from(commentLike)
    .where(
      and(
        eq(commentLike.comment_id, commentId),
        eq(commentLike.user_id, userId),
      ),
    );
  return rows.length > 0;
}

export async function insertCommentLike(
  commentId: number,
  userId: number,
  ex: Executor = db,
) {
  await ex
    .insert(commentLike)
    .values({ comment_id: commentId, user_id: userId });
}

export async function deleteCommentLike(
  commentId: number,
  userId: number,
  ex: Executor = db,
) {
  await ex
    .delete(commentLike)
    .where(
      and(
        eq(commentLike.comment_id, commentId),
        eq(commentLike.user_id, userId),
      ),
    );
}
