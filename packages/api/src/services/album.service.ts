import { withTransaction } from '../db/transaction';
import ContentTypeEnum from '../enums/contentTypeEnum';
import { BadRequestError, NotFoundError } from '../errors';
import * as albums from '../repositories/album.repository';
import * as contents from '../repositories/content.repository';
import * as photos from '../repositories/photo.repository';
import { parseId } from '../repositories/utils';
import { loadAccessibleBoard } from './board.service';
import { loadEditableContent } from './content.service';
import type { Actor } from './types';

export type AlbumInput = contents.ContentFields & {
  is_private?: boolean | null;
};

/**
 * Creates an album by the actor on the board, which they must be allowed to
 * write (404 for an unknown board, 403 otherwise). The content row and its
 * `tb_album` row are written together or not at all. Returns the content id.
 */
export async function createAlbum(
  actor: Actor,
  boardId: string,
  input: AlbumInput,
) {
  await loadAccessibleBoard(actor, boardId, 'write');
  return withTransaction(async (transaction) => {
    const contentId = await contents.insert(
      {
        author_id: actor._id,
        board_id: boardId,
        type: ContentTypeEnum.ALBUM,
        title: input.title,
        text: input.text,
        category_id: input.category_id,
      },
      transaction,
    );
    await albums.insert(contentId, input.is_private ?? null, transaction);
    return contentId;
  });
}

/**
 * Changes the content fields and `is_private` the input gives, together or
 * not at all. 404 when the album is deleted before the change.
 */
export function updateAlbum(
  actor: Actor,
  albumId: string,
  input: contents.ContentFields & { album: { is_private?: boolean | null } },
) {
  return withTransaction(async (transaction) => {
    const target = await loadEditableContent(
      actor,
      albumId,
      ContentTypeEnum.ALBUM,
      transaction,
    );
    const { album, ...fields } = input;
    if ((await contents.update(target.content_id, fields, transaction)) === 0) {
      throw new NotFoundError('Content not found');
    }
    await albums.update(target.content_id, album, transaction);
  });
}

/**
 * Makes a photo in the album its cover. Whoever may edit the album may pick
 * any of its photos; the author of a photo may also pick their own, as the
 * web has always allowed. 404 for a photo that isn't in the album.
 */
export async function setAlbumThumbnail(
  actor: Actor,
  albumId: string,
  photoId: unknown,
) {
  if (!photoId) {
    throw new BadRequestError('tn_photo_id can not be null');
  }
  const albumNumber = parseId(albumId);
  const photoNumber = parseId(photoId);
  if (albumNumber === null || photoNumber === null) {
    throw new NotFoundError('Photo not found in album');
  }
  const photo = await photos.findInAlbum(photoNumber, albumNumber);
  if (!photo) {
    throw new NotFoundError('Photo not found in album');
  }
  if (photo.author_id !== actor._id) {
    await loadEditableContent(actor, albumId, ContentTypeEnum.ALBUM);
  }
  await albums.setThumbnail(albumNumber, photo.content_id);
}

/**
 * Soft-deletes the album. Its photos stay, as they always have. 404 when
 * another request deleted it first.
 */
export async function deleteAlbum(actor: Actor, albumId: string) {
  const target = await loadEditableContent(
    actor,
    albumId,
    ContentTypeEnum.ALBUM,
  );
  if ((await contents.softDelete(target.content_id)) === 0) {
    throw new NotFoundError('Content not found');
  }
}
