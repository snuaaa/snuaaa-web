import {
  AttachedFileModel,
  BoardModel,
  ContentModel,
  DocumentModel,
  PostModel,
  UserModel,
} from '../models';
import uuid4 from 'uuid4';
import { Op } from 'sequelize';
import ContentTypeEnum from '../enums/contentTypeEnum';

const SearchTypeEnum = Object.freeze({
  ALL: 'A',
  TITLE: 'T',
  TEXT: 'X',
  USER: 'U',
});

export type PostResponse = ContentModel & {
  post: PostModel;
  user: UserModel;
  board: BoardModel;
  attachedFiles: AttachedFileModel[];
};

export async function retrievePost(content_id: string | number): Promise<PostResponse> {
  if (!content_id) {
    throw new Error('id can not be null');
  }

  const post = await ContentModel.findOne({
    include: [
      {
        model: PostModel,
        as: 'post',
        required: true,
      },
      {
        model: UserModel,
        required: true,
        attributes: [
          'user_uuid',
          'nickname',
          'introduction',
          'grade',
          'level',
          'email',
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
      {
        model: AttachedFileModel,
        as: 'attachedFiles',
      },
    ],
    where: { content_id: content_id },
  });

  if (!post) {
    throw new Error('Post not found');
  }

  return post as PostResponse;
}

export async function retrievePostsInBoard(board_id, rowNum, offset) {
  if (!board_id) {
    throw new Error('id can not be null');
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
        attributes: ['nickname'],
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

export type PostFilter = {
  board_id?: string;
  author_id?: string;
  read_grade: number;
  limit?: number;
  offset?: number;
  search_keyword?: string;
  search_type?: SearchType;
};

const getSearchCondition = (type?: SearchType, keyword?: string) => {
  if (!type || !keyword || keyword.trim() === '') {
    return {};
  }
  switch (type) {
    case 'all': {
      return {
        content: {
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
        },
      };
    }
    case 'title': {
      return {
        content: {
          title: {
            [Op.like]: `%${keyword}%`,
          },
        },
      };
    }
    case 'text': {
      return {
        content: {
          text: {
            [Op.like]: `%${keyword}%`,
          },
        },
      };
    }
    case 'user': {
      return {
        user: {
          nickname: {
            [Op.like]: `%${keyword}%`,
          },
        },
      };
    }
    default:
      return {};
  }
};

export function retrievePostsWithFilter(filter: PostFilter) {
  const {
    board_id,
    author_id,
    read_grade,
    limit = 20,
    offset = 0,
    search_keyword,
    search_type,
  } = filter;
  const { content, user } = getSearchCondition(search_type, search_keyword);
  return ContentModel.findAndCountAll({
    include: [
      {
        model: PostModel,
        as: 'post',
      },
      {
        model: UserModel,
        required: true,
        attributes: ['nickname'],
        paranoid: false, // 삭제된 유저의 글도 보이도록
        where: user,
      },
      {
        model: BoardModel,
        required: true,
        attributes: ['board_id', 'board_name'],
        where: {
          lv_read: {
            [Op.gte]: read_grade,
          },
        },
      },
    ],
    where: {
      type: ContentTypeEnum.POST,
      ...content,
      ...(board_id && { board_id }),
      ...(author_id && { author_id }),
    },
    order: [['created_at', 'DESC']],
    limit: limit,
    offset: offset,
  });
}

/**
 * @deprecated
 */
export async function searchPostsInBoard(board_id, type, keyword, rowNum, offset) {
  if (!board_id) {
    throw new Error('id can not be null');
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
        attributes: ['nickname'],
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
        attributes: ['nickname'],
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
    throw new Error('id can not be null');
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
    throw new Error('id can not be null');
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
        attributes: ['user_id', 'user_uuid', 'nickname', 'introduction', 'profile_path'],
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

export async function createPost(data) {
  const content = await ContentModel.create(
    {
      content_uuid: uuid4(),
      author_id: data.author_id,
      board_id: data.board_id,
      category_id: data.category_id,
      title: data.title,
      text: data.text,
      type: 'PO',
      post: {},
    },
    {
      include: [
        {
          model: PostModel,
          as: 'post',
        },
      ],
    },
  );

  return content.getDataValue('content_id');
}
