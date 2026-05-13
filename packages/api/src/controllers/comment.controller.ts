import { BoardModel, CommentModel, ContentModel, UserModel } from '../models';
import { Op } from 'sequelize';

export type CommentFilter = {
  author_id?: string;
  read_grade: number;
  limit?: number;
  offset?: number;
};

export function retrieveCommentsWithFilter(filter: CommentFilter) {
  const { author_id, read_grade, limit = 20, offset = 0 } = filter;
  return CommentModel.findAndCountAll({
    include: [
      {
        model: UserModel,
        required: true,
        attributes: [
          'user_id',
          'user_uuid',
          'nickname',
          'introduction',
          'grade',
          'level',
          'email',
          'profile_path',
        ],
        paranoid: false,
      },
      {
        model: ContentModel,
        required: true,
        include: [
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
      },
    ],
    where: {
      ...(author_id && { author_id }),
    },
    order: [['created_at', 'DESC']],
    limit: limit,
    offset: offset,
  });
}

export async function retrieveComments(parent_id, user_id) {
  if (!parent_id || !user_id) {
    throw new Error('id can not be null');
  }

  return CommentModel.findAll({
    include: [
      {
        model: UserModel,
        required: true,
        attributes: [
          'user_id',
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
        model: UserModel,
        // through: CommentLikeModel,
        as: 'likeUsers',
        attributes: [
          'user_id',
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
        model: CommentModel,
        as: 'children',
        include: [
          {
            model: UserModel,
            required: true,
            attributes: [
              'user_id',
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
            model: UserModel,
            // through: CommentLikeModel,
            as: 'likeUsers',
            attributes: [
              'user_id',
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
        ],
      },
    ],
    where: {
      parent_id: parent_id,
      parent_comment_id: null,
    },
    order: [
      ['created_at', 'asc'],
      ['children', 'created_at'],
    ],
  });
}

export async function retrieveRecentComments() {
  return CommentModel.findAll({
    include: [
      {
        model: ContentModel,
        required: true,
        include: [
          {
            model: BoardModel,
            required: true,
            attributes: ['board_id', 'board_name'],
          },
        ],
      },
    ],
    order: [['created_at', 'DESC']],
    limit: 5,
  });
}

export async function retrieveAllComments(grade, rowNum, offset) {
  return CommentModel.findAndCountAll({
    include: [
      {
        model: ContentModel,
        required: true,
        include: [
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
      },
    ],
    order: [['created_at', 'DESC']],
    limit: rowNum,
    offset: offset,
  });
}

/**
 * @deprecated
 */
export async function retrieveCommentsByUser(user_id) {
  if (!user_id) {
    throw new Error('id can not be null');
  }

  return CommentModel.findAll({
    include: [
      {
        model: ContentModel,
        required: true,
        include: [
          {
            model: BoardModel,
            required: true,
            attributes: ['board_id', 'board_name'],
          },
        ],
      },
    ],
    where: {
      author_id: user_id,
    },
    order: [['created_at', 'DESC']],
    limit: 15,
  });
}

/**
 * @deprecated
 */
export async function retrieveCommentsByUserUuid(user_uuid) {
  if (!user_uuid) {
    throw new Error('user_uuid can not be null');
  }

  return CommentModel.findAll({
    include: [
      {
        model: ContentModel,
        required: true,
        include: [
          {
            model: BoardModel,
            required: true,
            attributes: ['board_id', 'board_name'],
          },
        ],
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
    order: [['created_at', 'DESC']],
    limit: 15,
  });
}

export async function createComment(user_id, parent_id, data) {
  if (!user_id || !parent_id) {
    throw new Error('id can not be null');
  }

  const comment = await CommentModel.create({
    parent_id: parent_id,
    parent_comment_id: data.parent_comment_id ? data.parent_comment_id : null,
    author_id: user_id,
    text: data.text,
  });

  const comment_id = comment.getDataValue('comment_id');

  await ContentModel.increment('comment_num', {
    where: { content_id: parent_id },
    silent: true,
  });

  return comment_id;
}

export async function updateComment(comment_id, data) {
  if (!comment_id) {
    throw new Error('id can not be null');
  }

  await CommentModel.update(
    {
      text: data.text,
    },
    {
      where: {
        comment_id: comment_id,
      },
    },
  );
}

export async function deleteComment(comment_id) {
  if (!comment_id) {
    throw new Error('id can not be null');
  }

  const comment = await CommentModel.findOne({
    where: {
      comment_id: comment_id,
    },
  });

  await ContentModel.decrement('comment_num', {
    where: {
      content_id: comment.getDataValue('parent_id'),
    },
    silent: true,
  });

  await CommentModel.destroy({
    where: {
      comment_id: comment_id,
    },
  });
}
