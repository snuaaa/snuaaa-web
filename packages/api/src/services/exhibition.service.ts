import { withTransaction } from '../db/transaction';
import ContentTypeEnum from '../enums/contentTypeEnum';
import { NotFoundError } from '../errors';
import * as contents from '../repositories/content.repository';
import * as exhibitions from '../repositories/exhibition.repository';
import { resizeImageBuffer } from '../utils/resize';
import { uploadImageToS3 } from '../utils/upload';
import { loadAccessibleBoard } from './board.service';
import { loadEditableContent } from './content.service';
import type { Actor } from './types';

export type ExhibitionInput = contents.ContentFields &
  exhibitions.ExhibitionFields;

/** Resizes the poster and uploads it, with a 300px thumbnail, to S3. */
async function uploadPoster(poster: Buffer): Promise<exhibitions.PosterUrls> {
  const [original, thumbnail] = await Promise.all([
    resizeImageBuffer(poster),
    resizeImageBuffer(poster, { shortSideSize: 300 }),
  ]);
  const [url, thumbnailUrl] = await Promise.all([
    uploadImageToS3(original, 'exhibition'),
    uploadImageToS3(thumbnail, 'exhibition'),
  ]);
  return { url, thumbnailUrl };
}

function splitInput(input: ExhibitionInput) {
  const { title, text, category_id, ...fields } = input;
  return { content: { title, text, category_id }, fields };
}

/**
 * Creates an exhibition by the actor on the board, which they must be
 * allowed to write (404 for an unknown board, 403 otherwise). The poster is
 * uploaded first; the content row and its `tb_exhibition` row are then
 * written together or not at all. Returns the content id.
 */
export async function createExhibition(
  actor: Actor,
  boardId: string,
  input: ExhibitionInput,
  poster: Buffer,
) {
  await loadAccessibleBoard(actor, boardId, 'write');
  const posterUrls = await uploadPoster(poster);
  const { content, fields } = splitInput(input);
  return withTransaction(async (transaction) => {
    const contentId = await contents.insert(
      {
        ...content,
        author_id: actor._id,
        board_id: boardId,
        type: ContentTypeEnum.EXHIBITION,
      },
      transaction,
    );
    await exhibitions.insert(contentId, fields, posterUrls, transaction);
    return contentId;
  });
}

/**
 * Changes the given fields of the exhibition, which the actor must be
 * allowed to edit (404 for an unknown one, 403 otherwise). A new poster,
 * when given, is uploaded before anything is written; without one the
 * current poster stays.
 */
export async function updateExhibition(
  actor: Actor,
  exhibitionId: string,
  input: ExhibitionInput,
  poster?: Buffer,
) {
  // Checked before the upload too, so a refused request uploads nothing.
  await loadEditableContent(actor, exhibitionId, ContentTypeEnum.EXHIBITION);
  const posterUrls = poster ? await uploadPoster(poster) : undefined;
  const { content, fields } = splitInput(input);
  await withTransaction(async (transaction) => {
    const target = await loadEditableContent(
      actor,
      exhibitionId,
      ContentTypeEnum.EXHIBITION,
      transaction,
    );
    if (
      (await contents.update(target.content_id, content, transaction)) === 0
    ) {
      throw new NotFoundError('Content not found');
    }
    await exhibitions.update(
      target.content_id,
      fields,
      posterUrls,
      transaction,
    );
  });
}

/**
 * Soft-deletes the exhibition, which the actor must be allowed to edit. Its
 * photos stay.
 */
export async function deleteExhibition(actor: Actor, exhibitionId: string) {
  const target = await loadEditableContent(
    actor,
    exhibitionId,
    ContentTypeEnum.EXHIBITION,
  );
  if ((await contents.softDelete(target.content_id)) === 0) {
    throw new NotFoundError('Content not found');
  }
}
