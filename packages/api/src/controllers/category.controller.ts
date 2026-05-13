import { CategoryModel } from '../models';

export async function retrieveCategoryByBoard(board_id) {
  if (!board_id) {
    throw new Error('id can not be null');
  }

  return CategoryModel.findAll({
    where: { board_id: board_id },
  });
}
