import { CategoryModel } from '../models';
import { BadRequestError } from '../errors';

export async function retrieveCategoryByBoard(board_id) {
  if (!board_id) {
    throw new BadRequestError('id can not be null');
  }

  return CategoryModel.findAll({
    where: { board_id: board_id },
  });
}
