import type { Executor } from '../db/client';
import { NotFoundError } from '../errors';
import * as files from '../repositories/attachedFile.repository';
import * as contents from '../repositories/content.repository';
import * as likes from '../repositories/like.repository';
import { assertBoardAccess, assertCanEdit } from './permissions';
import type { Actor } from './types';

/**
 * Loads a content of `type` and checks that the actor may change it. Throws
 * 404 for an unknown or deleted content, or one of another type, and 403
 * when the actor is neither its author nor within the board's edit level.
 */
export async function loadEditableContent(
  actor: Actor,
  contentId: string,
  type: string,
  executor?: Executor,
) {
  const target = await contents.findWithBoard(contentId, executor);
  if (!target || target.type !== type) {
    throw new NotFoundError('Content not found');
  }
  assertCanEdit(actor, target);
  return target;
}

/**
 * Finishes reading a content the caller found: throws 403 unless the actor
 * may read its board, then counts the view (without touching `updated_at`)
 * and returns its files and whether the actor likes it. The returned
 * content still shows the view count from before this view.
 */
export async function readContent<
  T extends { content_id: number; board: { lv_read: number | null } },
>(actor: Actor, target: T) {
  assertBoardAccess(target.board, actor.grade, 'read');
  const [attachedFiles, liked] = await Promise.all([
    files.listByContents([target.content_id]),
    likes.hasContentLike(target.content_id, actor._id),
    contents.addToCounter(target.content_id, 'view_num', 1),
  ]);
  return { content: { ...target, attachedFiles }, liked };
}
