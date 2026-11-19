import { AuthorizationError } from '../errors';
import type { Actor } from './types';

/**
 * Whether the actor may edit or delete something: they wrote it, or their
 * grade is within the board's edit level (a lower grade means more
 * privilege). A missing board or level allows only the author.
 */
export function canEdit(
  actor: Actor,
  target: { author_id: number; lv_edit?: number | null },
) {
  const isAuthor = target.author_id === actor._id;
  const canEditBoard =
    typeof target.lv_edit === 'number' && actor.grade <= target.lv_edit;
  return isAuthor || canEditBoard;
}

/** Throws 403 (code 4001) unless `canEdit` allows the actor. */
export function assertCanEdit(
  actor: Actor,
  target: { author_id: number; lv_edit?: number | null },
) {
  if (!canEdit(actor, target)) {
    throw new AuthorizationError('Permission denied', { code: 4001 });
  }
}

type BoardLevels = { lv_read?: number | null; lv_write?: number | null };
export type BoardPermission = 'read' | 'write';

const LEVEL_FIELD = { read: 'lv_read', write: 'lv_write' } as const;

/**
 * Lower grade = more privilege, so a user can act on a board when their grade
 * is at or below the board's level. A missing level allows nobody, matching
 * the web's `canWrite`.
 */
export function canAccessBoard(
  board: BoardLevels,
  grade: number,
  permission: BoardPermission,
) {
  const level = board[LEVEL_FIELD[permission]];
  return typeof level === 'number' && grade <= level;
}

/** Throws 403 (code 4001) unless `grade` may read or write `board`. */
export function assertBoardAccess(
  board: BoardLevels,
  grade: number,
  permission: BoardPermission,
) {
  if (!canAccessBoard(board, grade, permission)) {
    throw new AuthorizationError('Permission denied', { code: 4001 });
  }
}
