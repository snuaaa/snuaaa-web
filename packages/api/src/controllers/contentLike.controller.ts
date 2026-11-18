import { ContentLikeModel } from '../models';
import { BadRequestError } from '../errors';
import type { Tx } from '../db/transaction';

export async function checkLike(content_id, user_id, tx?: Tx) {
  if (!user_id || !content_id) {
    throw new BadRequestError('id can not be null');
  }

  const contentLike = await ContentLikeModel.findOne({
    where: {
      content_id: content_id,
      user_id: user_id,
    },
    transaction: tx,
  });

  return !!contentLike;
}

/** Adds the like row only; the service keeps `like_num` in step. */
export async function insertContentLike(content_id, user_id, tx?: Tx) {
  if (!user_id || !content_id) {
    throw new BadRequestError('id can not be null');
  }

  await ContentLikeModel.create(
    {
      content_id: content_id,
      user_id: user_id,
    },
    { transaction: tx },
  );
}

/** Removes the like row only; the service keeps `like_num` in step. */
export async function deleteContentLike(content_id, user_id, tx?: Tx) {
  if (!user_id || !content_id) {
    throw new BadRequestError('id can not be null');
  }

  await ContentLikeModel.destroy({
    where: {
      content_id: content_id,
      user_id: user_id,
    },
    transaction: tx,
  });
}
