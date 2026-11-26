import { withTransaction } from '../db/transaction';
import ContentTypeEnum from '../enums/contentTypeEnum';
import { NotFoundError } from '../errors';
import * as contents from '../repositories/content.repository';
import * as documents from '../repositories/document.repository';
import { loadAccessibleBoard } from './board.service';
import * as files from '../repositories/attachedFile.repository';
import { loadEditableContent, readContent } from './content.service';
import type { Actor } from './types';

export type DocumentInput = contents.ContentFields & {
  generation?: number | null;
};

/**
 * Creates a document by the actor on the board, which they must be allowed
 * to write (404 for an unknown board, 403 otherwise). The content row and its
 * `tb_document` row are written together or not at all. Returns the content
 * id.
 */
export async function createDocument(
  actor: Actor,
  boardId: string,
  input: DocumentInput,
) {
  await loadAccessibleBoard(actor, boardId, 'write');
  return withTransaction(async (transaction) => {
    const contentId = await contents.insert(
      {
        author_id: actor._id,
        board_id: boardId,
        type: ContentTypeEnum.DOCUMENT,
        title: input.title,
        text: input.text,
        category_id: input.category_id,
      },
      transaction,
    );
    await documents.insert(contentId, input.generation ?? null, transaction);
    return contentId;
  });
}

/**
 * Changes the title, text and category the input gives; the generation stays
 * as it was created. 404 when the document is deleted before the change.
 */
export async function updateDocument(
  actor: Actor,
  documentId: string,
  input: contents.ContentFields,
) {
  const target = await loadEditableContent(
    actor,
    documentId,
    ContentTypeEnum.DOCUMENT,
  );
  if ((await contents.update(target.content_id, input)) === 0) {
    throw new NotFoundError('Content not found');
  }
}

/**
 * Soft-deletes the content and removes its `tb_document` row, together or
 * not at all. 404 when another request deleted it first.
 */
export function deleteDocument(actor: Actor, documentId: string) {
  return withTransaction(async (transaction) => {
    const target = await loadEditableContent(
      actor,
      documentId,
      ContentTypeEnum.DOCUMENT,
      transaction,
    );
    if ((await contents.softDelete(target.content_id, transaction)) === 0) {
      throw new NotFoundError('Content not found');
    }
    await documents.remove(target.content_id, transaction);
  });
}

/**
 * The document with its author, board, files and whether the actor likes it,
 * counting the view. 404 for an unknown or deleted document, 403 above the
 * board's read level.
 */
export async function retrieveDocument(actor: Actor, documentId: string) {
  const target = await documents.findDetail(documentId);
  if (!target) {
    throw new NotFoundError('Document not found');
  }
  return readContent(actor, target);
}

export const DOCUMENTS_PER_PAGE = 10;

/**
 * A page of documents on the boards the actor may read, last updated first,
 * with their files, and how many there are in all.
 */
export async function listDocuments(
  actor: Actor,
  filter: Omit<documents.DocumentFilter, 'readGrade'> & { page: number },
) {
  const { page, ...rest } = filter;
  const where = { ...rest, readGrade: actor.grade };
  const [count, rows] = await Promise.all([
    documents.countList(where),
    documents.list(where, {
      limit: DOCUMENTS_PER_PAGE,
      offset: DOCUMENTS_PER_PAGE * (page - 1),
    }),
  ]);
  const attachedFiles = await files.listByContents(
    rows.map((row) => row.content_id),
  );
  return {
    count,
    rows: rows.map((row) => ({
      ...row,
      content: {
        ...row.content,
        attachedFiles: attachedFiles.filter(
          (file) => file.parent_id === row.content_id,
        ),
      },
    })),
  };
}
