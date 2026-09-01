import {
  BoardModel,
  ContentModel,
  ExhibitionModel,
  UserModel,
} from '../models';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { resizeImageBuffer } from '../utils/resize';
import { uploadImageToS3 } from '../utils/upload';

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
        attributes: [
          'user_id',
          'nickname',
          'introduction',
          'profile_path',
          'deleted_at',
        ],
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
        attributes: [
          'user_id',
          'nickname',
          'introduction',
          'profile_path',
          'deleted_at',
        ],
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
    poster_url: data.poster_url,
    poster_thumbnail_url: data.poster_thumbnail_url,
  });
}

export async function migrateExhibitionPosters() {
  const exhibitions = await ExhibitionModel.findAll({
    where: {
      poster_path: {
        [Op.and]: [{ [Op.ne]: null }, { [Op.like]: '/exhibition/%' }],
      },
      poster_url: {
        [Op.is]: null,
      },
    },
    limit: 10,
    order: [['content_id', 'ASC']],
  });

  await Promise.all(
    exhibitions.map(async (exhibition) => {
      const content_id = exhibition.getDataValue('content_id');
      const rawThumbnailPath = exhibition.getDataValue('poster_thumbnail_path');

      const filePath = path.join(
        '.',
        'upload',
        exhibition.getDataValue('poster_path'),
      );
      const thumbnailPath = rawThumbnailPath
        ? path.join('.', 'upload', rawThumbnailPath)
        : null;

      let buffer: Buffer;
      try {
        buffer = await fs.promises.readFile(filePath);
      } catch (err) {
        console.error(`Local exhibition poster not found: ${filePath}`, err);
        await ExhibitionModel.update(
          {
            poster_url: '',
            poster_thumbnail_url: '',
          },
          {
            where: { content_id: content_id },
          },
        );
        return;
      }

      const resizedOriginalBuffer = await resizeImageBuffer(buffer);
      const resizedThumbnailBuffer = await resizeImageBuffer(buffer, {
        shortSideSize: 300,
      });

      const [posterUrl, posterThumbnailUrl] = await Promise.all([
        uploadImageToS3(resizedOriginalBuffer, 'exhibition'),
        uploadImageToS3(resizedThumbnailBuffer, 'exhibition'),
      ]);

      await ExhibitionModel.update(
        {
          poster_url: posterUrl,
          poster_thumbnail_url: posterThumbnailUrl,
        },
        {
          where: { content_id: content_id },
        },
      );

      // if (thumbnailPath) {
      //   await fs.promises.unlink(thumbnailPath).catch((err) => {
      //     console.error(
      //       `Failed to delete local poster thumbnail: ${thumbnailPath}`,
      //       err,
      //     );
      //   });
      // }
    }),
  );
}
