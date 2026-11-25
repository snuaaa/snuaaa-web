import { withTransaction } from '../db/transaction';
import type { Executor } from '../db/client';
import ContentTypeEnum from '../enums/contentTypeEnum';
import { BadRequestError, NotFoundError } from '../errors';
import * as contents from '../repositories/content.repository';
import * as exhibitPhotos from '../repositories/exhibitPhoto.repository';
import * as exhibitions from '../repositories/exhibition.repository';
import * as likes from '../repositories/like.repository';
import * as users from '../repositories/user.repository';
import { resizeImageBuffer } from '../utils/resize';
import { uploadImageToS3 } from '../utils/upload';
import { loadAccessibleBoard } from './board.service';
import { loadEditableContent } from './content.service';
import { assertBoardAccess } from './permissions';
import type { Actor } from './types';

/** An exhibit photo's details as the web sends them. */
export type ExhibitPhotoInput = {
  title?: string | null;
  text?: string | null;
  /** A member picked from the search; `photographer_alt` is used otherwise. */
  photographer?: { user_uuid?: string | null } | null;
  /** The typed name, for a photographer who isn't a member. */
  photographer_alt?: string | null;
} & Omit<
  exhibitPhotos.ExhibitPhotoFields,
  'photographer_id' | 'photographer_alt'
>;

/**
 * The detail fields to store: the photographer is the member with the given
 * uuid, or, when there is none, the typed name.
 */
async function detailFields(
  input: ExhibitPhotoInput,
  executor?: Executor,
): Promise<exhibitPhotos.ExhibitPhotoFields> {
  const {
    title: _title,
    text: _text,
    photographer,
    photographer_alt,
    ...fields
  } = input;
  const photographerId = photographer?.user_uuid
    ? await users.findIdByUuid(photographer.user_uuid, executor)
    : null;
  return {
    ...fields,
    photographer_id: photographerId,
    photographer_alt: photographerId === null ? photographer_alt : null,
  };
}

/**
 * Adds a photo to the exhibition, by the actor, on the board the client
 * names. The actor must be allowed to write that board (404 for an unknown
 * board, 403 otherwise), and the exhibition must be on it (404 for an
 * unknown exhibition, 400 for one on another board), because the write check
 * uses the board the client names. The image is uploaded first; the content
 * row and its `tb_exhibit_photo` row are then written together or not at
 * all. Returns the content id.
 */
export async function createExhibitPhoto(
  actor: Actor,
  exhibitionId: string,
  target: { boardId: string; categoryId?: string | null },
  input: ExhibitPhotoInput,
  image: Buffer,
) {
  await loadAccessibleBoard(actor, target.boardId, 'write');
  const parent = await contents.findWithBoard(exhibitionId);
  if (!parent || parent.type !== ContentTypeEnum.EXHIBITION) {
    throw new NotFoundError('Content not found');
  }
  if (parent.board_id !== target.boardId) {
    throw new BadRequestError('board_id does not match the parent content');
  }
  const [original, thumbnail] = await Promise.all([
    resizeImageBuffer(image),
    resizeImageBuffer(image, { shortSideSize: 360 }),
  ]);
  const [url, thumbnailUrl] = await Promise.all([
    uploadImageToS3(original, 'exhibit-photo'),
    uploadImageToS3(thumbnail, 'exhibit-photo'),
  ]);
  return withTransaction(async (transaction) => {
    const fields = await detailFields(input, transaction);
    const contentId = await contents.insert(
      {
        title: input.title,
        text: input.text,
        category_id: target.categoryId,
        author_id: actor._id,
        board_id: target.boardId,
        type: ContentTypeEnum.EXHIBITI_PHOTO,
        parent_id: parent.content_id,
      },
      transaction,
    );
    await exhibitPhotos.insert(
      contentId,
      fields,
      { url, thumbnailUrl },
      transaction,
    );
    return contentId;
  });
}

/**
 * Changes the exhibit photo, which the actor must be allowed to edit (404
 * for an unknown one, 403 otherwise). Detail fields the web leaves out stay
 * as they are, except the date, which the web leaves out to clear it, and
 * the photographer, which is always set from `photographer` or
 * `photographer_alt`.
 */
export function updateExhibitPhoto(
  actor: Actor,
  photoId: string,
  input: ExhibitPhotoInput,
) {
  return withTransaction(async (transaction) => {
    const target = await loadEditableContent(
      actor,
      photoId,
      ContentTypeEnum.EXHIBITI_PHOTO,
      transaction,
    );
    const fields = await detailFields(input, transaction);
    const changed = await contents.update(
      target.content_id,
      { title: input.title, text: input.text },
      transaction,
    );
    if (changed === 0) {
      throw new NotFoundError('Content not found');
    }
    await exhibitPhotos.update(
      target.content_id,
      { ...fields, date: input.date ?? null },
      transaction,
    );
  });
}

/**
 * Deletes the exhibit photo, which the actor must be allowed to edit: its
 * content is soft-deleted and its `tb_exhibit_photo` row removed, together
 * or not at all.
 */
export function deleteExhibitPhoto(actor: Actor, photoId: string) {
  return withTransaction(async (transaction) => {
    const target = await loadEditableContent(
      actor,
      photoId,
      ContentTypeEnum.EXHIBITI_PHOTO,
      transaction,
    );
    if ((await contents.softDelete(target.content_id, transaction)) === 0) {
      throw new NotFoundError('Content not found');
    }
    await exhibitPhotos.remove(target.content_id, transaction);
  });
}

/**
 * The exhibit photo with its photographer (null for a typed name), its
 * exhibition (`parent`, null once deleted) and author; whether the actor
 * likes it; and the exhibition's photos. The actor must be allowed to read
 * its board (404 for an unknown photo, 403 otherwise). Counts a view, which
 * the answer doesn't include yet.
 */
export async function retrieveExhibitPhoto(actor: Actor, photoId: string) {
  const target = await exhibitPhotos.findDetail(photoId);
  if (!target) {
    throw new NotFoundError('Exhibit photo not found');
  }
  assertBoardAccess(target.board, actor.grade, 'read');
  const {
    board: _board,
    photographer,
    exhibitPhoto: details,
    ...rest
  } = target;
  const [parent, likeInfo, exhibitPhotosInfo] = await Promise.all([
    rest.parent_id === null ? null : exhibitions.find(rest.parent_id),
    likes.hasContentLike(rest.content_id, actor._id),
    rest.parent_id === null
      ? []
      : exhibitPhotos.listInExhibition(rest.parent_id),
    contents.addToCounter(rest.content_id, 'view_num', 1),
  ]);
  return {
    exhibitPhotoInfo: {
      ...rest,
      exhibitPhoto: { ...details, photographer },
      parent,
    },
    likeInfo,
    exhibitPhotosInfo,
  };
}
