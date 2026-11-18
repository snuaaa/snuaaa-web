import { withTransaction } from '../db/transaction';
import {
  addToContentCounter,
  lockContent,
} from '../controllers/content.controller';
import * as contentLikes from '../controllers/contentLike.controller';
import type { Actor } from './types';

/**
 * Likes the content, or takes the like back if the actor already likes it,
 * keeping `like_num` in step with the like rows. The content's row is locked
 * first, so two toggles at once run one after the other instead of both
 * inserting.
 */
export function toggleContentLike(actor: Actor, contentId: string) {
  return withTransaction(async (tx) => {
    await lockContent(contentId, tx);
    const liked = await contentLikes.checkLike(contentId, actor._id, tx);
    if (liked) {
      await contentLikes.deleteContentLike(contentId, actor._id, tx);
      await addToContentCounter(contentId, 'like_num', -1, tx);
    } else {
      await contentLikes.insertContentLike(contentId, actor._id, tx);
      await addToContentCounter(contentId, 'like_num', 1, tx);
    }
  });
}
