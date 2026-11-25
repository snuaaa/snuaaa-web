import { withTransaction } from '../db/transaction';
import ContentTypeEnum from '../enums/contentTypeEnum';
import { BadRequestError, NotFoundError } from '../errors';
import * as contents from '../repositories/content.repository';
import * as contentTags from '../repositories/contentTag.repository';
import * as photos from '../repositories/photo.repository';
import { loadAccessibleBoard } from './board.service';
import { loadEditableContent } from './content.service';
import type { Actor } from './types';

export type NewPhoto = contents.ContentFields &
  photos.ShotFields & {
    img_url: string;
    thumbnail_url: string;
    tags: string[];
  };

/**
 * Creates the photos by the actor on the board, in the album when one is
 * given. The actor must be allowed to write the board (404 for an unknown
 * board, 403 otherwise), and the album must be on that board (404 for an
 * unknown album, 400 for one on another board), because the write check uses
 * the board the client names. Every photo, its `tb_photo` row and its tags
 * are written together or not at all. Returns the new content ids in order.
 */
export async function createPhotos(
  actor: Actor,
  input: { boardId: string; albumId?: unknown; list: NewPhoto[] },
) {
  await loadAccessibleBoard(actor, input.boardId, 'write');
  return withTransaction(async (transaction) => {
    let albumId: number | null = null;
    if (input.albumId) {
      const album = await contents.findWithBoard(
        String(input.albumId),
        transaction,
      );
      if (!album || album.type !== ContentTypeEnum.ALBUM) {
        throw new NotFoundError('Content not found');
      }
      if (album.board_id !== input.boardId) {
        throw new BadRequestError('board_id does not match the parent content');
      }
      albumId = album.content_id;
    }
    const contentIds: number[] = [];
    for (const { tags, ...photo } of input.list) {
      const contentId = await contents.insert(
        {
          author_id: actor._id,
          board_id: input.boardId,
          type: ContentTypeEnum.PHOTO,
          parent_id: albumId,
          title: photo.title,
          text: photo.text,
          category_id: photo.category_id,
        },
        transaction,
      );
      await photos.insert(contentId, photo, transaction);
      await contentTags.add(contentId, [...new Set(tags)], transaction);
      contentIds.push(contentId);
    }
    return contentIds;
  });
}

/**
 * Changes the title, text and shooting details the input gives, and sets the
 * photo's tags to `tags`, together or not at all. 404 when the photo is
 * deleted before the change.
 */
export function updatePhoto(
  actor: Actor,
  photoId: string,
  input: Pick<contents.ContentFields, 'title' | 'text'> & {
    photo: photos.ShotFields;
    tags: string[];
  },
) {
  return withTransaction(async (transaction) => {
    const target = await loadEditableContent(
      actor,
      photoId,
      ContentTypeEnum.PHOTO,
      transaction,
    );
    const id = target.content_id;
    const fields = { title: input.title, text: input.text };
    if ((await contents.update(id, fields, transaction)) === 0) {
      throw new NotFoundError('Content not found');
    }
    await photos.update(id, input.photo, transaction);
    const tags = new Set(input.tags);
    const current = await contentTags.listTagIds(id, transaction);
    await contentTags.remove(
      id,
      current.filter((tagId) => !tags.has(tagId)),
      transaction,
    );
    await contentTags.add(
      id,
      [...tags].filter((tagId) => !current.includes(tagId)),
      transaction,
    );
  });
}

/**
 * Soft-deletes the content and removes its `tb_photo` row, together or not
 * at all. 404 when another request deleted it first.
 */
export function deletePhoto(actor: Actor, photoId: string) {
  return withTransaction(async (transaction) => {
    const target = await loadEditableContent(
      actor,
      photoId,
      ContentTypeEnum.PHOTO,
      transaction,
    );
    if ((await contents.softDelete(target.content_id, transaction)) === 0) {
      throw new NotFoundError('Content not found');
    }
    await photos.remove(target.content_id, transaction);
  });
}
