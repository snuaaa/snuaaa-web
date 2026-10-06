import { TagModel } from '../models';
import { BadRequestError } from '../errors';

export async function retrieveTagsOnBoard(board_id) {
  if (!board_id) {
    throw new BadRequestError('id can not be null');
  }

  return TagModel.findAll({
    where: { board_id: board_id },
    order: [
      ['tag_type', 'ASC'],
      ['tag_id', 'ASC'],
    ],
  });
}
