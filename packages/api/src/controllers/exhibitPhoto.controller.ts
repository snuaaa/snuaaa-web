import {
  ContentModel,
  ExhibitionModel,
  ExhibitPhotoModel,
  UserModel,
} from '../models';
import { BASE_USER_FIELDS } from '../models/User';

export async function retrieveExhibitPhoto(exhibitPhoto_id) {
  return ContentModel.findOne({
    include: [
      {
        model: ExhibitPhotoModel,
        as: 'exhibitPhoto',
        where: {
          content_id: exhibitPhoto_id,
        },
        include: [
          {
            model: UserModel,
            as: 'photographer',
            attributes: BASE_USER_FIELDS,
            paranoid: false,
          },
        ],
      },
      {
        model: ContentModel,
        as: 'parent',
        include: [
          {
            model: ExhibitionModel,
            as: 'exhibition',
            required: true,
          },
        ],
      },
      {
        model: UserModel,
        as: 'user',
        required: true,
        attributes: BASE_USER_FIELDS,
        paranoid: false,
      },
    ],
  });
}

export async function retrieveExhibitPhotosInExhibition(exhibition_id) {
  return ContentModel.findAll({
    include: [
      {
        model: ExhibitPhotoModel,
        as: 'exhibitPhoto',
        required: true,
      },
    ],
    where: {
      parent_id: exhibition_id,
    },
    order: [
      ['exhibitPhoto', 'order', 'ASC'],
      ['created_at', 'ASC'],
    ],
  });
}
