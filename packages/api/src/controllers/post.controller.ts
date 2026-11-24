import {
  BoardModel,
  ContentModel,
  DocumentModel,
  PostModel,
  UserModel,
} from '../models';
import { Op } from 'sequelize';
import ContentTypeEnum from '../enums/contentTypeEnum';
import { BadRequestError } from '../errors';

const SearchTypeEnum = Object.freeze({
  ALL: 'A',
  TITLE: 'T',
  TEXT: 'X',
  USER: 'U',
});

export async function retrievePostsInBoard(board_id, rowNum, offset) {
  if (!board_id) {
    throw new BadRequestError('id can not be null');
  }

  return ContentModel.findAndCountAll({
    include: [
      {
        model: PostModel,
        as: 'post',
      },
      {
        model: UserModel,
        required: true,
        attributes: ['nickname', 'profile_path', 'profile_url'],
        paranoid: false,
      },
    ],
    where: { board_id: board_id },
    order: [['created_at', 'DESC']],
    limit: rowNum,
    offset: offset,
  });
}

export type SearchType = 'title' | 'text' | 'user' | 'all';

/**
 * @deprecated
 */
export async function searchPostsInBoard(
  board_id,
  type,
  keyword,
  rowNum,
  offset,
) {
  if (!board_id) {
    throw new BadRequestError('id can not be null');
  }

  let contentCondition;
  let userCondition;
  if (type === SearchTypeEnum.ALL) {
    contentCondition = {
      board_id: board_id,
      [Op.or]: [
        {
          title: {
            [Op.like]: `%${keyword}%`,
          },
        },
        {
          text: {
            [Op.like]: `%${keyword}%`,
          },
        },
      ],
    };
  } else if (type === SearchTypeEnum.TITLE) {
    contentCondition = {
      board_id: board_id,
      title: {
        [Op.like]: `%${keyword}%`,
      },
    };
  } else if (type === SearchTypeEnum.TEXT) {
    contentCondition = {
      board_id: board_id,
      text: {
        [Op.like]: `%${keyword}%`,
      },
    };
  } else if (type === SearchTypeEnum.USER) {
    contentCondition = {
      board_id: board_id,
    };
    userCondition = {
      nickname: {
        [Op.like]: `%${keyword}%`,
      },
    };
  } else {
    contentCondition = {
      board_id: board_id,
    };
  }

  return ContentModel.findAndCountAll({
    include: [
      {
        model: PostModel,
        required: true,
        as: 'post',
      },
      {
        model: UserModel,
        required: true,
        attributes: ['nickname', 'profile_path', 'profile_url'],
        where: userCondition,
        paranoid: false,
      },
    ],
    where: contentCondition,
    order: [['created_at', 'DESC']],
    limit: rowNum,
    offset: offset,
  });
}

export async function retrieveRecentPosts(grade) {
  return ContentModel.findAll({
    include: [
      {
        model: PostModel,
        as: 'post',
      },
      {
        model: DocumentModel,
        as: 'document',
      },
      {
        model: BoardModel,
        required: true,
        attributes: ['board_id', 'board_name'],
        where: {
          lv_read: {
            [Op.gte]: grade,
          },
        },
      },
    ],
    where: {
      [Op.or]: [
        {
          type: ContentTypeEnum.POST,
        },
        {
          type: ContentTypeEnum.DOCUMENT,
        },
      ],
    },
    order: [['updated_at', 'DESC']],
    limit: 7,
  });
}

export async function retrieveAllPosts(grade, rowNum, offset) {
  return ContentModel.findAndCountAll({
    include: [
      {
        model: PostModel,
        as: 'post',
        required: true,
      },
      {
        model: BoardModel,
        required: true,
        attributes: ['board_id', 'board_name'],
        where: {
          lv_read: {
            [Op.gte]: grade,
          },
        },
      },
      {
        model: UserModel,
        required: true,
        attributes: ['nickname', 'profile_path', 'profile_url'],
        paranoid: false,
      },
    ],
    order: [['updated_at', 'DESC']],
    limit: rowNum,
    offset: offset,
  });
}

/**
 * @deprecated
 */
export async function retrievePostsByUser(user_id) {
  if (!user_id) {
    throw new BadRequestError('id can not be null');
  }

  return ContentModel.findAll({
    include: [
      {
        model: PostModel,
        as: 'post',
        required: true,
      },
      {
        model: BoardModel,
        required: true,
        attributes: ['board_id', 'board_name'],
      },
    ],
    where: {
      author_id: user_id,
    },
    order: [['updated_at', 'DESC']],
    limit: 10,
  });
}

/**
 * @deprecated
 */
export async function retrievePostsByUserUuid(user_uuid) {
  if (!user_uuid) {
    throw new BadRequestError('id can not be null');
  }

  return ContentModel.findAll({
    include: [
      {
        model: PostModel,
        as: 'post',
        required: true,
      },
      {
        model: BoardModel,
        required: true,
        attributes: ['board_id', 'board_name'],
      },
      {
        model: UserModel,
        required: true,
        attributes: [
          'user_id',
          'user_uuid',
          'nickname',
          'introduction',
          'profile_path',
        ],
        where: {
          user_uuid: user_uuid,
        },
      },
    ],
    order: [['updated_at', 'DESC']],
    limit: 10,
  });
}

export async function retrieveSoundBox() {
  return ContentModel.findOne({
    attributes: ['content_id', 'title', 'text'],
    include: [
      {
        model: PostModel,
        as: 'post',
        required: true,
      },
      {
        model: BoardModel,
        required: true,
        attributes: [],
      },
    ],
    where: { board_id: 'brd01' },
    order: [['updated_at', 'DESC']],
    limit: 1,
  });
}
