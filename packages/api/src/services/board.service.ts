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

/** The boards the actor may read, with their tags and categories. */
export async function listReadableBoards(actor: Actor) {
  return boards.listReadable(actor.grade);
}

/**
 * The board with its tags and categories. Throws 404 for an unknown board
 * and 403 when the actor may not read it.
 */
export async function retrieveBoard(actor: Actor, boardId: string) {
  const board = await boards.findWithTagsAndCategories(boardId);
  if (!board) {
    throw new NotFoundError('id is not correct');
  }
  assertBoardAccess(board, actor.grade, 'read');
  return board;
}
