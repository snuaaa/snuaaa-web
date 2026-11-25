import {
  AlbumModel,
  BoardModel,
  CategoryModel,
  ContentModel,
  PhotoModel,
  UserModel,
} from '../models';
import { Op } from 'sequelize';
import { BASE_USER_FIELDS } from '../models/User';
import { BadRequestError, NotFoundError } from '../errors';
import { SearchType } from './post.controller';
import { getSearchCondition } from '../utils/searchCondition';

export type AlbumSearch = {
  search_type?: SearchType;
  search_keyword?: string;
};

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
        attributes: BASE_USER_FIELDS,
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
    throw new NotFoundError('Album not found');
  }

  return album as AlbumResponse;
}

export async function retrievePrevAlbum(album_id, board_id) {
  if (!board_id) {
    throw new BadRequestError('board_id can not be null');
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
    throw new BadRequestError('board_id can not be null');
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

export async function retrieveAlbumCount(
  board_id,
  category_id,
  search: AlbumSearch = {},
) {
  if (!board_id) {
    throw new BadRequestError('id can not be null');
  }
  const { content, user } = getSearchCondition(
    search.search_type,
    search.search_keyword,
  );

  return ContentModel.count({
    include: [
      {
        model: AlbumModel,
        as: 'album',
        required: true,
      },
      ...(user
        ? [
            {
              model: UserModel,
              required: true,
              attributes: [],
              paranoid: false,
              where: user,
            },
          ]
        : []),
    ],
    where: {
      ...(board_id && { board_id: board_id }),
      ...(category_id && { category_id: category_id }),
      ...content,
    },
  });
}

export async function retrieveAlbumsInBoard(
  board_id,
  rowNum,
  offset,
  category_id,
  search: AlbumSearch = {},
) {
  if (!board_id) {
    throw new BadRequestError('board_id can not be null');
  }
  const { content, user } = getSearchCondition(
    search.search_type,
    search.search_keyword,
  );

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
        attributes: BASE_USER_FIELDS,
        paranoid: false,
        where: user,
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
      ...content,
    },
    order: [['created_at', 'DESC']],
    limit: rowNum,
    offset: offset,
  });
}
