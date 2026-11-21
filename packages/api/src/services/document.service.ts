import { withTransaction } from '../db/transaction';
import ContentTypeEnum from '../enums/contentTypeEnum';
import { NotFoundError } from '../errors';
import * as contents from '../repositories/content.repository';
import * as documents from '../repositories/document.repository';
import { loadAccessibleBoard } from './board.service';
import { loadEditableContent } from './content.service';
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
