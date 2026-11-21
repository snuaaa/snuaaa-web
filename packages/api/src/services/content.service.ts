import type { Executor } from '../db/client';
import { NotFoundError } from '../errors';
import * as contents from '../repositories/content.repository';
import { assertCanEdit } from './permissions';
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
