import {
  AlbumModel,
  CategoryModel,
  ContentModel,
  PhotoModel,
  UserModel,
} from '../models';
import { BASE_USER_FIELDS } from '../models/User';
import { BadRequestError } from '../errors';
import { SearchType } from './post.controller';
import { getSearchCondition } from '../utils/searchCondition';

export type AlbumSearch = {
  search_type?: SearchType;
  search_keyword?: string;
};

/** The board's newest albums, for the home page (`/api/home/memory`). */
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
