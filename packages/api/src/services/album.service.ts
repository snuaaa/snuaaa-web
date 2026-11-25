import { withTransaction } from '../db/transaction';
import ContentTypeEnum from '../enums/contentTypeEnum';
import { BadRequestError, NotFoundError } from '../errors';
import * as albums from '../repositories/album.repository';
import * as categories from '../repositories/category.repository';
import * as contents from '../repositories/content.repository';
import * as photos from '../repositories/photo.repository';
import * as tags from '../repositories/tag.repository';
import { parseId } from '../repositories/utils';
import { canReadBoard, loadAccessibleBoard } from './board.service';
import { loadEditableContent } from './content.service';
import { assertBoardAccess } from './permissions';
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
  if (photo.author_id === actor._id) {
    // The photo's author skips the edit check, but not a deleted album.
    const target = await contents.findWithBoard(albumNumber);
    if (!target || target.type !== ContentTypeEnum.ALBUM) {
      throw new NotFoundError('Content not found');
    }
  } else {
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

/**
 * Loads the (not deleted) album and checks that the actor may read its
 * board. Throws 404 for an unknown album and 403 above the read level.
 */
async function loadReadableAlbum(actor: Actor, albumId: string) {
  const target = await albums.findDetail(albumId);
  if (!target) {
    throw new NotFoundError('Album not found');
  }
  assertBoardAccess(target.board, actor.grade, 'read');
  return target;
}

/**
 * The album with its author and board, and its board's categories and tags.
 * Reading an album doesn't count a view.
 */
export async function retrieveAlbum(actor: Actor, albumId: string) {
  const target = await loadReadableAlbum(actor, albumId);
  const [categoryInfo, tagInfo] = await Promise.all([
    categories.listOnBoard(target.board.board_id),
    tags.listOnBoard(target.board.board_id),
  ]);
  return { albumInfo: target, categoryInfo, tagInfo };
}

/** The album's photos, newest first. */
export async function listAlbumPhotos(actor: Actor, albumId: string) {
  const target = await loadReadableAlbum(actor, albumId);
  return photos.listInAlbum(target.content_id);
}

/** The web shows 12 albums a page. */
const ALBUMS_PER_PAGE = 12;

export type AlbumListQuery = {
  /** From 1. */
  page: number;
  categoryId?: string;
  searchType?: string;
  searchKeyword?: string;
};

/**
 * A page of the board's albums, newest first, and how many there are in
 * all. The actor must be allowed to read the board (404 for an unknown
 * board, 403 otherwise). Each album carries its cover photo
 * (`album.thumbnail`, null when none is set or it was deleted) and its
 * newest photo (`children`, empty when it has none).
 */
export async function listAlbums(
  actor: Actor,
  boardId: string,
  query: AlbumListQuery,
) {
  await loadAccessibleBoard(actor, boardId, 'read');
  const filter: albums.AlbumFilter = {
    boardId,
    categoryId: query.categoryId,
    searchType: query.searchType,
    searchKeyword: query.searchKeyword,
  };
  const [albumCount, rows] = await Promise.all([
    albums.countList(filter),
    albums.list(filter, {
      limit: ALBUMS_PER_PAGE,
      offset: ALBUMS_PER_PAGE * (query.page - 1),
    }),
  ]);
  const albumInfo = await withCoverAndNewestPhoto(rows);
  return { albumCount, albumInfo };
}

/**
 * Adds each album's cover photo (`album.thumbnail`, null when none is set
 * or it was deleted) and its newest photo (`children`, empty when it has
 * none).
 */
async function withCoverAndNewestPhoto(
  rows: Awaited<ReturnType<typeof albums.list>>,
) {
  const coverIds = rows.flatMap((row) =>
    row.album.tn_photo_id === null ? [] : [row.album.tn_photo_id],
  );
  const [covers, latest] = await Promise.all([
    photos.listByIds(coverIds),
    photos.listLatestInAlbums(rows.map((row) => row.content_id)),
  ]);
  const coverById = new Map(covers.map((cover) => [cover.content_id, cover]));
  const latestByAlbum = new Map(
    latest.map((photo) => [photo.parent_id, photo]),
  );
  return rows.map((row) => {
    const newest = latestByAlbum.get(row.content_id);
    return {
      ...row,
      album: {
        ...row.album,
        thumbnail:
          row.album.tn_photo_id === null
            ? null
            : (coverById.get(row.album.tn_photo_id) ?? null),
      },
      children: newest ? [newest] : [],
    };
  });
}

/**
 * The board's newest albums, like a page of `listAlbums`, for the home
 * page. Empty when the board is unknown or the actor may not read it.
 */
export async function listNewestAlbums(
  actor: Actor,
  boardId: string,
  limit: number,
) {
  if (!(await canReadBoard(actor, boardId))) {
    return [];
  }
  const rows = await albums.list({ boardId }, { limit, offset: 0 });
  return withCoverAndNewestPhoto(rows);
}
