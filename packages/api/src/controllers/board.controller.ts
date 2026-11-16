import { BoardModel, CategoryModel, TagModel } from '../models';
import { Op } from 'sequelize';
import { AuthorizationError, BadRequestError, NotFoundError } from '../errors';

export async function retrieveBoard(board_id) {
  if (!board_id) {
    throw new BadRequestError('id can not be null');
  }
  const board = await BoardModel.findOne({
    include: [
      {
        model: TagModel,
        as: 'tags',
      },
      {
        model: CategoryModel,
        as: 'categories',
      },
    ],
    where: { board_id: board_id },
  });

  if (!board) {
    throw new NotFoundError('id is not correct');
  }
  return board;
}

export async function retrieveBoards() {
  return BoardModel.findAll({});
}

export async function retrieveBoardsCanAccess(grade) {
  return BoardModel.findAll({
    include: [
      {
        model: TagModel,
        as: 'tags',
      },
      {
        model: CategoryModel,
        as: 'categories',
      },
    ],
    where: {
      lv_read: {
        [Op.gte]: grade,
      },
    },
    order: [
      ['menu', 'ASC'],
      ['order', 'ASC'],
    ],
  });
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

/**
 * Loads the board by id and checks the permission. Throws 400 without an id,
 * 404 for an unknown board and 403 when the grade is not allowed.
 */
export async function assertBoardAccessById(
  board_id: unknown,
  grade: number,
  permission: BoardPermission,
) {
  if (!board_id || typeof board_id !== 'string') {
    throw new BadRequestError('board_id is required');
  }
  const board = await BoardModel.findByPk(board_id, {
    attributes: ['board_id', 'lv_read', 'lv_write'],
  });
  if (!board) {
    throw new NotFoundError('id is not correct');
  }
  assertBoardAccess(board.get({ plain: true }), grade, permission);
  return board;
}
