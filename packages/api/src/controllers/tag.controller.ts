import { TagModel } from '../models';

export async function retrieveTagsOnBoard(board_id) {
  if (!board_id) {
    throw new Error('id can not be null');
  }

  return TagModel.findAll({
    where: { board_id: board_id },
    order: [
      ['tag_type', 'ASC'],
      ['tag_id', 'ASC'],
    ],
  });
}
