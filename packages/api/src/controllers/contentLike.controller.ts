import { ContentLikeModel, ContentModel } from '../models';

export async function checkLike(content_id, user_id) {
  if (!user_id || !content_id) {
    throw new Error('id can not be null');
  }

  const contentLike = await ContentLikeModel.findOne({
    where: {
      content_id: content_id,
      user_id: user_id,
    },
  });

  return !!contentLike;
}

export async function likeContent(content_id, user_id) {
  if (!user_id || !content_id) {
    throw new Error('id can not be null');
  }

  await ContentLikeModel.create({
    content_id: content_id,
    user_id: user_id,
  });

  await ContentModel.increment('like_num', {
    where: { content_id: content_id },
    silent: true,
  });
}

export async function dislikeContent(content_id, user_id) {
  if (!user_id || !content_id) {
    throw new Error('id can not be null');
  }

  await ContentLikeModel.destroy({
    where: {
      content_id: content_id,
      user_id: user_id,
    },
  });

  await ContentModel.decrement('like_num', {
    where: { content_id: content_id },
    silent: true,
  });
}
