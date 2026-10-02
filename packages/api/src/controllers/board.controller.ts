import { BoardModel, CategoryModel, TagModel } from '../models';
import { Op } from 'sequelize';
import { BadRequestError, NotFoundError } from '../errors';

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
