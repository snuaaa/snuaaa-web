import { withTransaction } from '../db/transaction';
import ContentTypeEnum from '../enums/contentTypeEnum';
import { BadRequestError, NotFoundError } from '../errors';
import * as albums from '../repositories/album.repository';
import * as contents from '../repositories/content.repository';
import * as contentTags from '../repositories/contentTag.repository';
import * as likes from '../repositories/like.repository';
import * as photos from '../repositories/photo.repository';
import * as tags from '../repositories/tag.repository';
import * as users from '../repositories/user.repository';
import { loadAccessibleBoard } from './board.service';
import { loadEditableContent } from './content.service';
import { assertBoardAccess } from './permissions';
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

/**
 * The photo the web opens, with its album (`parent`, null when it has none
 * or the album was deleted), author, board and tags, plus:
 * - whether the actor likes it, and the board's tags;
 * - the photos before and after it (`prevPhoto`, `nextPhoto`): in its album,
 *   or, outside an album, among the board's photos outside one; with
 *   `byAuthor`, among the author's photos on the boards the actor may read;
 * - the newest photo of the board's albums before and after its album
 *   (`prevAlbumPhoto`, `nextAlbumPhoto`).
 *
 * Throws 404 for an unknown or deleted photo and 403 when the actor may not
 * read its board. Counts the view; the answer shows the count before it.
 */
export async function retrievePhoto(
  actor: Actor,
  photoId: string,
  { byAuthor = false } = {},
) {
  const target = await photos.findDetail(photoId);
  if (!target) {
    throw new NotFoundError('Photo not found');
  }
  assertBoardAccess(target.board, actor.grade, 'read');
  const neighbour = (direction: photos.Direction) =>
    byAuthor
      ? photos.findNeighbourByAuthor(
          target.content_id,
          target.author_id,
          actor.grade,
          direction,
        )
      : photos.findNeighbourInAlbum(target, direction);
  const albumNeighbour = (direction: photos.Direction) =>
    target.parent_id === null
      ? null
      : photos.findInNeighbourAlbum(
          target.parent_id,
          target.board.board_id,
          direction,
        );
  const [
    parent,
    photoTags,
    likeInfo,
    boardTagInfo,
    prevPhoto,
    nextPhoto,
    prevAlbumPhoto,
    nextAlbumPhoto,
  ] = await Promise.all([
    target.parent_id === null ? null : albums.findParent(target.parent_id),
    tags.listByContents([target.content_id]),
    likes.hasContentLike(target.content_id, actor._id),
    tags.listOnBoard(target.board.board_id),
    neighbour('prev'),
    neighbour('next'),
    albumNeighbour('prev'),
    albumNeighbour('next'),
    contents.addToCounter(target.content_id, 'view_num', 1),
  ]);
  return {
    photoInfo: { ...target, parent, tags: photoTags },
    likeInfo,
    boardTagInfo,
    prevPhoto,
    nextPhoto,
    prevAlbumPhoto,
    nextAlbumPhoto,
  };
}

export type PhotoListQuery = {
  boardId?: string;
  /** Only this member's photos; 404 when no such (current) member exists. */
  userUuid?: string;
  /** Photos with any of these tags; each lists only these of its tags. */
  tagIds?: string[];
  limit: number;
  offset: number;
  searchType?: string;
  searchKeyword?: string;
};

/**
 * A page of photos on the boards the actor may read, newest first, with
 * their tags, and how many there are in all.
 */
export async function listPhotos(actor: Actor, query: PhotoListQuery) {
  let authorId: number | undefined;
  if (query.userUuid) {
    const userId = await users.findIdByUuid(query.userUuid);
    if (userId === null) {
      throw new NotFoundError('User not found');
    }
    authorId = userId;
  }
  const filter: photos.PhotoFilter = {
    readGrade: actor.grade,
    boardId: query.boardId,
    authorId,
    tagIds: query.tagIds,
    searchType: query.searchType,
    searchKeyword: query.searchKeyword,
  };
  const [count, rows] = await Promise.all([
    photos.countList(filter),
    photos.list(filter, { limit: query.limit, offset: query.offset }),
  ]);
  const photoTags = await tags.listByContents(
    rows.map((row) => row.content_id),
    query.tagIds,
  );
  return {
    count,
    rows: rows.map((row) => ({
      ...row,
      tags: photoTags.filter(
        (photoTag) => photoTag.contentTag.content_id === row.content_id,
      ),
    })),
  };
}
