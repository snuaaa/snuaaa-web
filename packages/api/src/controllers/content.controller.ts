import { BoardModel, ContentModel } from '../models';
import uuid4 from 'uuid4';
import { AuthorizationError, BadRequestError, NotFoundError } from '../errors';
import { JWTPayload } from '../utils/token';

export async function createContent(user_id, board_id, data, type) {
  if (!user_id || !board_id) {
    throw new BadRequestError('id can not be null');
  }

  const content = await ContentModel.create({
    content_uuid: uuid4(),
    author_id: user_id,
    board_id: board_id,
    category_id: data.category_id,
    title: data.title,
    text: data.text,
    type: type,
  });

  return content.getDataValue('content_id');
}

/**
 * Throws unless the user wrote the content or their grade is within the
 * board's edit level (a lower grade means more privilege).
 */
export async function assertCanEditContent(content_id, user: JWTPayload) {
  const content = await ContentModel.findByPk(content_id, {
    attributes: ['content_id', 'author_id'],
    include: [{ model: BoardModel, attributes: ['lv_edit'] }],
  });
  if (!content) {
    throw new NotFoundError('Content not found');
  }
  const board = content.get('board') as BoardModel | undefined;
  const isAuthor = content.getDataValue('author_id') === user._id;
  const canEditBoard = !!board && user.grade <= board.getDataValue('lv_edit');
  if (!isAuthor && !canEditBoard) {
    throw new AuthorizationError('Permission denied', { code: 4001 });
  }
}

export async function updateContent(content_id, data) {
  if (!content_id) {
    throw new BadRequestError('id can not be null');
  }

  await ContentModel.update(
    {
      title: data.title,
      text: data.text,
      category_id: data.category_id,
    },
    {
      where: {
        content_id: content_id,
      },
    },
  );
}

export async function deleteContent(content_id) {
  if (!content_id) {
    throw new BadRequestError('id can not be null');
  }

  await ContentModel.destroy({
    where: {
      content_id: content_id,
    },
  });
}

export async function increaseViewNum(content_id) {
  if (!content_id) {
    throw new BadRequestError('id can not be null');
  }

  await ContentModel.increment('view_num', {
    where: { content_id: content_id },
    silent: true,
  });
}
