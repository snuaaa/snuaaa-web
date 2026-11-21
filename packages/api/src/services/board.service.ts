import type { Executor } from '../db/client';
import { NotFoundError } from '../errors';
import * as boards from '../repositories/board.repository';
import { assertBoardAccess, type BoardPermission } from './permissions';
import type { Actor } from './types';

/**
 * Loads the board and checks that the actor may read or write it. Throws 404
 * for an unknown board and 403 when the actor's grade is not allowed.
 */
export async function loadAccessibleBoard(
  actor: Actor,
  boardId: string,
  permission: BoardPermission,
  executor?: Executor,
) {
  const board = await boards.findLevels(boardId, executor);
  if (!board) {
    throw new NotFoundError('id is not correct');
  }
  assertBoardAccess(board, actor.grade, permission);
  return board;
}
