import { CommentLikeModel } from '../models';

export async function checkCommentLike(comment_id, user_id) {
  if (!user_id || !comment_id) {
    throw new Error('id can not be null');
  }

  const commentLike = await CommentLikeModel.findOne({
    where: {
      comment_id: comment_id,
      user_id: user_id,
    },
  });

  return !!commentLike;
}

export async function likeComment(comment_id, user_id) {
  if (!user_id || !comment_id) {
    throw new Error('id can not be null');
  }

  await CommentLikeModel.create({
    comment_id: comment_id,
    user_id: user_id,
  });
}

export async function dislikeComment(comment_id, user_id) {
  if (!user_id || !comment_id) {
    throw new Error('id can not be null');
  }

  await CommentLikeModel.destroy({
    where: {
      comment_id: comment_id,
      user_id: user_id,
    },
  });
}
