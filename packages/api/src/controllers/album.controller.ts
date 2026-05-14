import {
  AlbumModel,
  BoardModel,
  CategoryModel,
  ContentModel,
  PhotoModel,
  UserModel,
} from '../models';
import { Op } from 'sequelize';

export type AlbumResponse = ContentModel & {
  album: AlbumModel;
  user: UserModel;
  board: BoardModel;
};

export async function retrieveAlbum(
  content_id: string | number,
): Promise<AlbumResponse> {
  const album = await ContentModel.findOne({
    include: [
      {
        model: AlbumModel,
        as: 'album',
        required: true,
      },
      {
        model: UserModel,
        required: true,
        attributes: ['user_id', 'nickname', 'introduction', 'profile_path'],
        paranoid: false,
      },
      {
        model: BoardModel,
        required: true,
        attributes: ['board_id', 'board_name', 'lv_read'],
      },
    ],
    where: { content_id: content_id },
  });

  if (!album) {
    throw new Error('Album not found');
  }

  return album as AlbumResponse;
}

export async function retrievePrevAlbum(album_id, board_id) {
  if (!board_id) {
    throw new Error('board_id can not be null');
  }

  return ContentModel.findOne({
    include: [
      {
        model: AlbumModel,
        as: 'album',
        required: true,
      },
    ],
    where: {
      content_id: {
        [Op.lt]: album_id,
      },
      board_id: board_id,
    },
    order: [['content_id', 'DESC']],
  });
}

export async function retrieveNextAlbum(album_id, board_id) {
  if (!board_id) {
    throw new Error('board_id can not be null');
  }

  return ContentModel.findOne({
    include: [
      {
        model: AlbumModel,
        as: 'album',
        required: true,
      },
    ],
    where: {
      content_id: {
        [Op.gt]: album_id,
      },
      board_id: board_id,
    },
    order: [['content_id', 'ASC']],
  });
}

export async function retrieveAlbumCount(board_id, category_id) {
  if (!board_id) {
    throw new Error('id can not be null');
  }

  return ContentModel.count({
    include: [
      {
        model: AlbumModel,
        as: 'album',
        required: true,
      },
    ],
    where: {
      ...(board_id && { board_id: board_id }),
      ...(category_id && { category_id: category_id }),
    },
  });
}

export async function retrieveAlbumsInBoard(
  board_id,
  rowNum,
  offset,
  category_id,
) {
  if (!board_id) {
    throw new Error('board_id can not be null');
  }

  return ContentModel.findAll({
    include: [
      {
        model: AlbumModel,
        as: 'album',
        required: true,
        include: [
          {
            model: ContentModel,
            as: 'thumbnail',
            include: [
              {
                model: PhotoModel,
                as: 'photo',
                required: true,
              },
            ],
          },
        ],
      },
      {
        model: UserModel,
        required: true,
        attributes: ['nickname', 'deleted_at'],
        paranoid: false,
      },
      {
        model: CategoryModel,
      },
      {
        model: ContentModel,
        as: 'children',
        required: false,
        separate: true,
        limit: 1,
        order: [['content_id', 'DESC']],
        include: [
          {
            model: PhotoModel,
            as: 'photo',
            required: true,
          },
        ],
      },
    ],
    where: {
      board_id: board_id,
      ...(category_id && { category_id: category_id }),
    },
    order: [['created_at', 'DESC']],
    limit: rowNum,
    offset: offset,
  });
}

export async function createAlbum(content_id, data) {
  if (!content_id) {
    throw new Error('id can not be null');
  }

  await AlbumModel.create({
    content_id: content_id,
    is_private: data.is_private,
  });
}

export async function updateAlbum(album_id, data) {
  if (!album_id) {
    throw new Error('album_id can not be null');
  }

  await AlbumModel.update(
    {
      is_private: data.is_private,
    },
    {
      where: {
        content_id: album_id,
      },
    },
  );
}

export async function updateAlbumThumbnail(album_id, photo_id) {
  if (!album_id) {
    throw new Error('album_id can not be null');
  }

  await AlbumModel.update(
    {
      tn_photo_id: photo_id,
    },
    {
      where: {
        content_id: album_id,
      },
    },
  );
}
