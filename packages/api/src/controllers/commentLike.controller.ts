import { CommentLikeModel } from '../models';
import { BadRequestError } from '../errors';
import type { Tx } from '../db/transaction';

export async function checkCommentLike(comment_id, user_id, tx?: Tx) {
  if (!user_id || !comment_id) {
    throw new BadRequestError('id can not be null');
  }

  const commentLike = await CommentLikeModel.findOne({
    where: {
      comment_id: comment_id,
      user_id: user_id,
    },
    transaction: tx,
  });

  return !!commentLike;
}

export async function likeComment(comment_id, user_id, tx?: Tx) {
  if (!user_id || !comment_id) {
    throw new BadRequestError('id can not be null');
  }

  await CommentLikeModel.create(
    {
      comment_id: comment_id,
      user_id: user_id,
    },
    { transaction: tx },
  );
}

export async function dislikeComment(comment_id, user_id, tx?: Tx) {
  if (!user_id || !comment_id) {
    throw new BadRequestError('id can not be null');
  }

  await CommentLikeModel.destroy({
    where: {
      comment_id: comment_id,
      user_id: user_id,
    },
    transaction: tx,
  });
}
