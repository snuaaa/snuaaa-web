import { BoardModel, CommentModel, ContentModel, UserModel } from '../models';
import { Op } from 'sequelize';
import { BASE_USER_FIELDS } from '../models/User';
import { BadRequestError } from '../errors';
import type { Tx } from '../db/transaction';

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
        attributes: BASE_USER_FIELDS,
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
    throw new BadRequestError('id can not be null');
  }

  return CommentModel.findAll({
    include: [
      {
        model: UserModel,
        required: true,
        attributes: BASE_USER_FIELDS,
        paranoid: false,
      },
      {
        model: UserModel,
        // through: CommentLikeModel,
        as: 'likeUsers',
        attributes: BASE_USER_FIELDS,
        paranoid: false,
      },
      {
        model: CommentModel,
        as: 'children',
        include: [
          {
            model: UserModel,
            required: true,
            attributes: BASE_USER_FIELDS,
            paranoid: false,
          },
          {
            model: UserModel,
            // through: CommentLikeModel,
            as: 'likeUsers',
            attributes: BASE_USER_FIELDS,
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

export async function createComment(user_id, parent_id, data, tx?: Tx) {
  if (!user_id || !parent_id) {
    throw new BadRequestError('id can not be null');
  }

  const comment = await CommentModel.create(
    {
      parent_id: parent_id,
      parent_comment_id: data.parent_comment_id ? data.parent_comment_id : null,
      author_id: user_id,
      text: data.text,
    },
    { transaction: tx },
  );

  return comment.getDataValue('comment_id');
}

export async function updateComment(comment_id, data, tx?: Tx) {
  if (!comment_id) {
    throw new BadRequestError('id can not be null');
  }

  await CommentModel.update(
    {
      text: data.text,
    },
    {
      where: {
        comment_id: comment_id,
      },
      transaction: tx,
    },
  );
}

/**
 * Soft-deletes the comment. Returns how many rows it deleted: 0 when another
 * request deleted it first.
 */
export async function deleteComment(comment_id, tx?: Tx) {
  if (!comment_id) {
    throw new BadRequestError('id can not be null');
  }

  return CommentModel.destroy({
    where: {
      comment_id: comment_id,
    },
    transaction: tx,
  });
}

/**
 * Locks the comment's row until `tx` ends, so requests that change the same
 * comment run one after another. Returns whether the comment exists.
 */
export async function lockComment(comment_id, tx: Tx) {
  if (!/^\d+$/.test(String(comment_id))) {
    return false;
  }
  const comment = await CommentModel.findByPk(comment_id, {
    attributes: ['comment_id'],
    lock: tx.LOCK.UPDATE,
    transaction: tx,
  });
  return !!comment;
}

/**
 * What deciding who may edit the comment needs: its author, the content it
 * is on, and the edit level of that content's board. Null when the comment
 * doesn't exist (or is deleted).
 */
export async function retrieveCommentForEdit(comment_id, tx?: Tx) {
  // A non-numeric id would make Postgres throw (a 500), so treat it as missing.
  if (!/^\d+$/.test(String(comment_id))) {
    return null;
  }
  const comment = await CommentModel.findByPk(comment_id, {
    attributes: ['comment_id', 'author_id', 'parent_id'],
    include: [
      {
        model: ContentModel,
        attributes: ['content_id'],
        include: [{ model: BoardModel, attributes: ['lv_edit'] }],
      },
    ],
    transaction: tx,
  });
  if (!comment) {
    return null;
  }
  const content = comment.get('content') as ContentModel | undefined;
  const board = content?.get('board') as BoardModel | undefined;
  return {
    comment_id: comment.getDataValue('comment_id'),
    author_id: comment.getDataValue('author_id'),
    parent_id: comment.getDataValue('parent_id'),
    lv_edit: board?.getDataValue('lv_edit') ?? null,
  };
}
