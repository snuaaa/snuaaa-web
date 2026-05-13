import { BoardModel, ContentModel, ExhibitionModel, UserModel } from '../models';

export async function retrieveExhibition(exhibition_id) {
  if (!exhibition_id) {
    throw new Error('exhibition_id can not be null');
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
        attributes: ['user_id', 'nickname', 'introduction', 'profile_path', 'deleted_at'],
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
        attributes: ['user_id', 'nickname', 'introduction', 'profile_path', 'deleted_at'],
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

export async function createExhibition(content_id, data) {
  if (!content_id) {
    throw new Error('content_id can not be null');
  }

  await ExhibitionModel.create({
    content_id: content_id,
    exhibition_no: data.exhibition_no,
    slogan: data.slogan,
    date_start: data.date_start,
    date_end: data.date_end,
    place: data.place,
    poster_path: data.poster_path,
    poster_thumbnail_path: data.poster_thumbnail_path,
  });
}
