import { ContentModel, ExhibitionModel, ExhibitPhotoModel, UserModel } from '../models';

export async function createExhibitPhoto(data) {
  await ContentModel.create(
    {
      content_uuid: data.content_uuid,
      author_id: data.author_id,
      board_id: data.board_id,
      category_id: data.category_id,
      parent_id: data.parent_id,
      title: data.title,
      text: data.text,
      type: data.type,
      exhibitPhoto: {
        // exhibition_id: data.exhibition_id,
        order: data.order,
        photographer_id: data.photographer_id,
        photographer_alt: data.photographer_alt,
        file_path: data.file_path,
        thumbnail_path: data.thumbnail_path,
        location: data.location,
        camera: data.camera,
        lens: data.lens,
        exposure_time: data.exposure_time,
        focal_length: data.focal_length,
        f_stop: data.f_stop,
        iso: data.iso,
        date: data.date,
      },
    },
    {
      include: [
        {
          model: ExhibitPhotoModel,
          as: 'exhibitPhoto',
        },
      ],
    },
  );
}

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
            attributes: ['user_uuid', 'nickname', 'introduction', 'profile_path', 'deleted_at'],
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
        attributes: ['user_id', 'nickname', 'introduction', 'profile_path', 'deleted_at'],
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

export async function updateExhibitPhoto(exhibitPhoto_id, data) {
  if (!exhibitPhoto_id) {
    throw new Error('exhibitPhoto_id can not be null');
  }

  await ExhibitPhotoModel.update(
    {
      photographer_id: data.photographer_id,
      photographer_alt: data.photographer_alt,
      order: data.order,
      file_path: data.file_path,
      thumbnail_path: data.thumbnail_path,
      location: data.location,
      camera: data.camera,
      lens: data.lens,
      exposure_time: data.exposure_time,
      focal_length: data.focal_length,
      f_stop: data.f_stop,
      iso: data.iso,
      date: data.date,
    },
    {
      where: {
        content_id: exhibitPhoto_id,
      },
    },
  );
}

export async function deleteExhibitPhoto(exhibitPhoto_id) {
  if (!exhibitPhoto_id) {
    throw new Error('exhibitPhoto_id can not be null');
  }

  await ExhibitPhotoModel.destroy({
    where: {
      content_id: exhibitPhoto_id,
    },
  });
}
