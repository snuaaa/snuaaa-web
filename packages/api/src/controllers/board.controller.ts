import { BoardModel, CategoryModel, TagModel } from '../models';
import { Op } from 'sequelize';
import { BadRequestError, NotFoundError } from '../errors';
import {
  assertBoardAccess,
  type BoardPermission,
} from '../services/permissions';

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

// The board rules live in the services now; Express routes still import them
// from here until their domains move (#158).
export {
  assertBoardAccess,
  canAccessBoard,
  type BoardPermission,
} from '../services/permissions';

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
