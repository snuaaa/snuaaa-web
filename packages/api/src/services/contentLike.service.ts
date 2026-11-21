import { withTransaction } from '../db/transaction';
import { NotFoundError } from '../errors';
import * as contents from '../repositories/content.repository';
import * as likes from '../repositories/like.repository';
import { assertBoardAccess } from './permissions';
import type { Actor } from './types';

/**
 * Likes the content, or takes the like back if the actor already likes it,
 * keeping `like_num` in step with the like rows. The content's row is locked
 * first, so two toggles at once run one after the other instead of both
 * inserting. 404 for an unknown or deleted content, 403 when the actor may
 * not read its board.
 */
export function toggleContentLike(actor: Actor, contentId: string) {
  return withTransaction(async (transaction) => {
    const target = await contents.lock(contentId, transaction);
    if (!target) {
      throw new NotFoundError('Content not found');
    }
    assertBoardAccess(target, actor.grade, 'read');
    const id = target.content_id;
    if (await likes.hasContentLike(id, actor._id, transaction)) {
      if ((await likes.deleteContentLike(id, actor._id, transaction)) > 0) {
        await contents.addToCounter(id, 'like_num', -1, transaction);
      }
    } else {
      await likes.insertContentLike(id, actor._id, transaction);
      await contents.addToCounter(id, 'like_num', 1, transaction);
    }
  });
}
