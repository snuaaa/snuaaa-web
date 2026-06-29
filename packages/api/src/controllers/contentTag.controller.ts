import { ContentTagModel } from '../models';

export async function retrieveTagsByContent(content_id) {
  if (!content_id) {
    throw new Error('id can not be null');
  }

  return ContentTagModel.findAll({
    where: {
      content_id: content_id,
    },
  });
}

export async function createContentTag(content_id, tag_id) {
  if (!content_id || !tag_id) {
    throw new Error('id can not be null');
  }

  await ContentTagModel.create({
    content_id: content_id,
    tag_id: tag_id,
  });
}

export async function deleteContentTag(content_id, tag_id) {
  if (!content_id || !tag_id) {
    throw new Error('id can not be null');
  }

  await ContentTagModel.destroy({
    where: {
      content_id: content_id,
      tag_id: tag_id,
    },
  });
}

export async function checkContentTag(content_id, tag_id) {
  if (!content_id || !tag_id) {
    throw new Error('id can not be null');
  }

  const isExist = await ContentTagModel.findOne({
    where: {
      content_id: content_id,
      tag_id: tag_id,
    },
  });

  return !!isExist;
}

export async function updateContentTag(content_id: number, tagList: string[]) {
  const prevTags = await ContentTagModel.findAll({
    where: {
      content_id: content_id,
    },
  });
  const prevTagIds = prevTags.map((tag) => tag.get('tag_id') as string);

  const tagsToAdd = tagList.filter((tagId) => !prevTagIds.includes(tagId));
  const tagsToRemove = prevTagIds.filter((tagId) => !tagList.includes(tagId));

  await Promise.all([
    ...tagsToAdd.map((tagId) => createContentTag(content_id, tagId)),
    ...tagsToRemove.map((tagId) => deleteContentTag(content_id, tagId)),
  ]);
}
