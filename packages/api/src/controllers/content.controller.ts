import { BoardModel, ContentModel } from '../models';
import uuid4 from 'uuid4';
import { AuthorizationError, BadRequestError, NotFoundError } from '../errors';
import { JWTPayload } from '../utils/token';
import type { Tx } from '../db/transaction';

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
 * Whether the user wrote the content or their grade is within the board's
 * edit level (a lower grade means more privilege). With `type`, a content of
 * another type counts as not found, so one route can't delete another type's
 * row. Throws NotFoundError when the content doesn't exist.
 */
export async function canEditContent(
  content_id,
  user: JWTPayload,
  type?: string,
): Promise<boolean> {
  const content = await ContentModel.findByPk(content_id, {
    attributes: ['content_id', 'author_id', 'type'],
    include: [{ model: BoardModel, attributes: ['lv_edit'] }],
  });
  if (!content || (type && content.getDataValue('type') !== type)) {
    throw new NotFoundError('Content not found');
  }
  const board = content.get('board') as BoardModel | undefined;
  const isAuthor = content.getDataValue('author_id') === user._id;
  const canEditBoard = !!board && user.grade <= board.getDataValue('lv_edit');
  return isAuthor || canEditBoard;
}

/**
 * Throws 404 unless `content_id` is a content of `type`, and 400 unless it
 * belongs to `board_id`. Write routes check lv_write on the `board_id` the
 * client sends, so a child (an album's photo, an exhibition's photo) must not
 * point at a parent in another board.
 */
export async function assertContentInBoard(
  content_id,
  board_id: unknown,
  type: string,
) {
  // A non-numeric id would make Postgres throw (a 500), so treat it as missing.
  if (!/^\d+$/.test(String(content_id))) {
    throw new NotFoundError('Content not found');
  }
  const content = await ContentModel.findByPk(content_id, {
    attributes: ['content_id', 'board_id', 'type'],
  });
  if (!content || content.getDataValue('type') !== type) {
    throw new NotFoundError('Content not found');
  }
  if (content.getDataValue('board_id') !== board_id) {
    throw new BadRequestError('board_id does not match the parent content');
  }
}

/** Throws unless `canEditContent` allows the user. */
export async function assertCanEditContent(
  content_id,
  user: JWTPayload,
  type?: string,
) {
  if (!(await canEditContent(content_id, user, type))) {
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

/**
 * Adds `by` (negative to subtract) to one of the content's counters, without
 * touching `updated_at`.
 */
export async function addToContentCounter(
  content_id,
  counter: 'comment_num' | 'like_num',
  by: number,
  tx?: Tx,
) {
  if (!content_id) {
    throw new BadRequestError('id can not be null');
  }

  await ContentModel.increment(counter, {
    by,
    where: { content_id: content_id },
    silent: true,
    transaction: tx,
  });
}

/**
 * Locks the content's row until `tx` ends, so requests that change the same
 * content (e.g. like toggles) run one after another. Returns whether the
 * content exists.
 */
export async function lockContent(content_id, tx: Tx) {
  if (!/^\d+$/.test(String(content_id))) {
    return false;
  }
  const content = await ContentModel.findByPk(content_id, {
    attributes: ['content_id'],
    lock: tx.LOCK.UPDATE,
    transaction: tx,
  });
  return !!content;
}
