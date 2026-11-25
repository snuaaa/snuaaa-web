import { BoardModel, CommentModel, ContentModel, UserModel } from '../models';
import { Op } from 'sequelize';
import { BadRequestError } from '../errors';

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
    throw new BadRequestError('id can not be null');
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
    throw new BadRequestError('user_uuid can not be null');
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
    order: [['created_at', 'DESC']],
    limit: 15,
  });
}
