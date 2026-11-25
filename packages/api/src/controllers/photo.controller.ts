import { ContentModel, PhotoModel, UserModel } from '../models';
import { BadRequestError } from '../errors';

/** The board's newest photos, for the home page (`/api/home/astrophoto`). */
export async function retrievePhotosInBoard(board_id, rowNum, offset) {
  if (!board_id) {
    throw new BadRequestError('id can not be null');
  }

  return ContentModel.findAll({
    include: [
      {
        model: PhotoModel,
        as: 'photo',
        required: true,
      },
      {
        model: UserModel,
        required: true,
        attributes: ['nickname', 'deleted_at'],
        paranoid: false,
      },
    ],
    where: { board_id: board_id },
    order: [
      ['created_at', 'DESC'],
      ['content_id', 'DESC'],
    ],
    limit: rowNum,
    offset: offset,
  });
}
