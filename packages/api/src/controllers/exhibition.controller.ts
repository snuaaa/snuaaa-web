import {
  BoardModel,
  ContentModel,
  ExhibitionModel,
  UserModel,
} from '../models';
import { BASE_USER_FIELDS } from '../models/User';
import { BadRequestError } from '../errors';

export async function retrieveExhibition(exhibition_id) {
  if (!exhibition_id) {
    throw new BadRequestError('exhibition_id can not be null');
  }

  return ContentModel.findOne({
    include: [
      {
        model: ExhibitionModel,
        as: 'exhibition',
        // require: true
      },
      {
        model: UserModel,
        required: true,
        attributes: BASE_USER_FIELDS,
        paranoid: false,
      },
      {
        model: BoardModel,
        required: true,
        attributes: ['board_id', 'board_name', 'lv_read', 'lv_write'],
      },
    ],
    where: { content_id: exhibition_id },
  });
}

export async function retrieveExhibitions() {
  return ContentModel.findAll({
    include: [
      {
        model: ExhibitionModel,
        as: 'exhibition',
        required: true,
      },
      {
        model: UserModel,
        required: true,
        attributes: BASE_USER_FIELDS,
        paranoid: false,
      },
      {
        model: BoardModel,
        required: true,
        attributes: ['board_id', 'board_name', 'lv_read'],
      },
    ],
    order: [['exhibition', 'exhibition_no', 'DESC']],
  });
}
