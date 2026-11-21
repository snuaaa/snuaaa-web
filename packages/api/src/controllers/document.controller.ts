import {
  AttachedFileModel,
  BoardModel,
  CategoryModel,
  ContentModel,
  DocumentModel,
  UserModel,
} from '../models';
import { BASE_USER_FIELDS } from '../models/User';
import { BadRequestError, NotFoundError } from '../errors';

export type DocumentResponse = ContentModel & {
  document: DocumentModel;
  user: UserModel;
  board: BoardModel;
  attachedFiles: AttachedFileModel[];
};

export async function retrieveDocument(
  doc_id: string | number,
): Promise<DocumentResponse> {
  if (!doc_id) {
    throw new BadRequestError('id can not be null');
  }

  const doc = await ContentModel.findOne({
    include: [
      {
        model: DocumentModel,
        as: 'document',
        required: true,
      },
      {
        model: UserModel,
        required: true,
        attributes: BASE_USER_FIELDS,
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

  if (!doc) {
    throw new NotFoundError('Document not found');
  }

  return doc as DocumentResponse;
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

export async function retrieveDocuments(
  rowNum,
  offset,
  category_id,
  generation,
) {
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
