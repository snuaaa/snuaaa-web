import { ContentLikeModel } from '../models';
import { BadRequestError } from '../errors';

export async function checkLike(content_id, user_id) {
  if (!user_id || !content_id) {
    throw new BadRequestError('id can not be null');
  }

  const contentLike = await ContentLikeModel.findOne({
    where: {
      content_id: content_id,
      user_id: user_id,
    },
  });

  return !!contentLike;
}
