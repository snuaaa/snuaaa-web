import {
  ContentModel,
  ExhibitionModel,
  ExhibitPhotoModel,
  UserModel,
} from '../models';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { resizeImageBuffer } from '../utils/resize';
import { uploadImageToS3 } from '../utils/upload';

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
        img_url: data.img_url,
        thumbnail_url: data.thumbnail_url,
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
            attributes: [
              'user_uuid',
              'nickname',
              'introduction',
              'profile_path',
              'deleted_at',
            ],
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
        attributes: [
          'user_id',
          'nickname',
          'introduction',
          'profile_path',
          'deleted_at',
        ],
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
      img_url: data.img_url,
      thumbnail_url: data.thumbnail_url,
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

export async function migrateExhibitPhotos() {
  const photos = await ExhibitPhotoModel.findAll({
    where: {
      file_path: {
        [Op.and]: [{ [Op.ne]: null }, { [Op.like]: '/exhibition/%' }],
      },
      img_url: {
        [Op.is]: null,
      },
    },
    limit: 10,
    order: [['content_id', 'ASC']],
  });

  await Promise.all(
    photos.map(async (photo) => {
      const content_id = photo.getDataValue('content_id');
      const rawThumbnailPath = photo.getDataValue('thumbnail_path');

      const filePath = path.join(
        '.',
        'upload',
        photo.getDataValue('file_path'),
      );
      const thumbnailPath = rawThumbnailPath
        ? path.join('.', 'upload', rawThumbnailPath)
        : null;

      let buffer: Buffer;
      try {
        buffer = await fs.promises.readFile(filePath);
      } catch (err) {
        console.error(`Local exhibit photo file not found: ${filePath}`, err);
        await ExhibitPhotoModel.update(
          {
            img_url: '',
            thumbnail_url: '',
          },
          {
            where: { content_id: content_id },
          },
        );
        return;
      }

      const resizedOriginalBuffer = await resizeImageBuffer(buffer);
      const resizedThumbnailBuffer = await resizeImageBuffer(buffer, {
        shortSideSize: 360,
      });

      const [imgUrl, thumbnailUrl] = await Promise.all([
        uploadImageToS3(resizedOriginalBuffer, 'exhibit-photo'),
        uploadImageToS3(resizedThumbnailBuffer, 'exhibit-photo'),
      ]);

      await ExhibitPhotoModel.update(
        {
          img_url: imgUrl,
          thumbnail_url: thumbnailUrl,
          file_path: imgUrl,
          thumbnail_path: thumbnailUrl,
        },
        {
          where: { content_id: content_id },
        },
      );

      // await fs.promises.unlink(filePath).catch((err) => {
      //   console.error(`Failed to delete local original file: ${filePath}`, err);
      // });
      // if (thumbnailPath) {
      //   await fs.promises.unlink(thumbnailPath).catch((err) => {
      //     console.error(
      //       `Failed to delete local thumbnail file: ${thumbnailPath}`,
      //       err,
      //     );
      //   });
      // }
    }),
  );
}
