import { withTransaction } from '../db/transaction';
import { NotFoundError } from '../errors';
import * as contents from '../repositories/content.repository';
import * as likes from '../repositories/like.repository';
import type { Actor } from './types';

/**
 * Likes the content, or takes the like back if the actor already likes it,
 * keeping `like_num` in step with the like rows. The content's row is locked
 * first, so two toggles at once run one after the other instead of both
 * inserting. 404 for an unknown content.
 */
export function toggleContentLike(actor: Actor, contentId: string) {
  return withTransaction(async (tx) => {
    if (!(await contents.lock(contentId, tx))) {
      throw new NotFoundError('Content not found');
    }
    const id = Number(contentId);
    if (await likes.hasContentLike(id, actor._id, tx)) {
      if ((await likes.deleteContentLike(id, actor._id, tx)) > 0) {
        await contents.addToCounter(id, 'like_num', -1, tx);
      }
    } else {
      await likes.insertContentLike(id, actor._id, tx);
      await contents.addToCounter(id, 'like_num', 1, tx);
    }
  });
}
