import { ContentModel } from '../models';
import uuid4 from 'uuid4';

export async function createContent(user_id, board_id, data, type) {
  if (!user_id || !board_id) {
    throw new Error('id can not be null');
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

export async function updateContent(content_id, data) {
  if (!content_id) {
    throw new Error('id can not be null');
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
    throw new Error('id can not be null');
  }

  await ContentModel.destroy({
    where: {
      content_id: content_id,
    },
  });
}

export async function increaseViewNum(content_id) {
  if (!content_id) {
    throw new Error('id can not be null');
  }

  await ContentModel.increment('view_num', {
    where: { content_id: content_id },
    silent: true,
  });
}
