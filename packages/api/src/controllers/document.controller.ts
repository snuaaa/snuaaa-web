import {
  AttachedFileModel,
  BoardModel,
  CategoryModel,
  ContentModel,
  DocumentModel,
  UserModel,
} from '../models';

export async function retrieveDocument(doc_id) {
  if (!doc_id) {
    throw new Error('id can not be null');
  }

  return ContentModel.findOne({
    include: [
      {
        model: DocumentModel,
        as: 'document',
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
        separate: true,
      },
    ],
    where: { content_id: doc_id },
  });
}

export async function retrieveDocumentCount(category_id, generation) {
  return DocumentModel.count({
    include: [
      {
        model: ContentModel,
        as: 'content',
        required: true,
        include: [
          {
            model: UserModel,
            required: true,
            attributes: ['nickname', 'deleted_at'],
            paranoid: false,
          },
          {
            model: CategoryModel,
            required: true,
            attributes: ['category_name'],
          },
        ],
        where: {
          ...(category_id && { category_id: category_id }),
        },
      },
    ],
    where: {
      ...(generation && { generation: generation }),
    },
  });
}

export async function retrieveDocuments(rowNum, offset, category_id, generation) {
  return DocumentModel.findAll({
    include: [
      {
        model: ContentModel,
        as: 'content',
        required: true,
        attributes: ['content_id', 'title', 'text'],
        include: [
          {
            model: UserModel,
            required: true,
            attributes: ['nickname', 'deleted_at'],
            paranoid: false,
          },
          {
            model: CategoryModel,
            required: true,
            attributes: ['category_name'],
          },
          {
            model: AttachedFileModel,
            as: 'attachedFiles',
            separate: true,
          },
        ],
        where: {
          ...(category_id && { category_id: category_id }),
        },
      },
    ],
    attributes: ['content_id', 'generation'],
    where: {
      ...(generation && { generation: generation }),
    },
    limit: rowNum,
    offset: offset,
    order: [
      [
        {
          model: ContentModel,
          as: 'content',
        },
        'updated_at',
        'DESC',
      ],
    ],
  });
}

export async function createDocument(data) {
  const content = await ContentModel.create(
    {
      content_uuid: data.content_uuid,
      author_id: data.author_id,
      board_id: data.board_id,
      category_id: data.category_id,
      title: data.title,
      text: data.text,
      type: data.type,
      document: {
        generation: data.generation,
      },
    },
    {
      include: [
        {
          model: DocumentModel,
          as: 'document',
        },
      ],
    },
  );

  return content.getDataValue('content_id');
}

export async function deleteDocument(doc_id) {
  if (!doc_id) {
    throw new Error('id can not be null');
  }

  await DocumentModel.destroy({
    where: {
      content_id: doc_id,
    },
  });
}
