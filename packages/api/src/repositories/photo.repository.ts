import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  gt,
  gte,
  inArray,
  isNull,
  lt,
} from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { board, content, contentTag, photo, user } from '../db/schema';
import ContentTypeEnum from '../enums/contentTypeEnum';
import { contentJson, searchCondition } from './content.repository';
import { authorJson } from './user.repository';
import { parseId } from './utils';

/** The shooting details a photo stores next to its images. */
export type ShotFields = {
  location?: string | null;
  camera?: string | null;
  lens?: string | null;
  exposure_time?: string | null;
  focal_length?: string | null;
  f_stop?: string | null;
  iso?: string | null;
  date?: Date | null;
};

/** Adds the `tb_photo` detail row of a content. */
export async function insert(
  contentId: number,
  fields: ShotFields & { img_url: string; thumbnail_url: string },
  executor: Executor = database,
) {
  await executor.insert(photo).values({
    content_id: contentId,
    img_url: fields.img_url,
    thumbnail_url: fields.thumbnail_url,
    location: fields.location ?? null,
    camera: fields.camera ?? null,
    lens: fields.lens ?? null,
    exposure_time: fields.exposure_time ?? null,
    focal_length: fields.focal_length ?? null,
    f_stop: fields.f_stop ?? null,
    iso: fields.iso ?? null,
    date: fields.date ?? null,
  });
}

/** Changes the shooting details that are given (undefined ones stay). */
export async function update(
  contentId: number,
  fields: ShotFields,
  executor: Executor = database,
) {
  const values = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  );
  if (Object.keys(values).length === 0) {
    return;
  }
  await executor
    .update(photo)
    .set(values)
    .where(eq(photo.content_id, contentId));
}

/**
 * Removes the `tb_photo` row. Deleting a photo has always removed this row
 * for good while only soft-deleting its content.
 */
export async function remove(contentId: number, executor: Executor = database) {
  await executor.delete(photo).where(eq(photo.content_id, contentId));
}

/** The (not deleted) photo in the album with its author, or null. */
export async function findInAlbum(
  photoId: number,
  albumId: number,
  executor: Executor = database,
) {
  const [row] = await executor
    .select({ content_id: content.content_id, author_id: content.author_id })
    .from(content)
    .where(
      and(
        eq(content.content_id, photoId),
        eq(content.parent_id, albumId),
        eq(content.type, ContentTypeEnum.PHOTO),
        isNull(content.deleted_at),
      ),
    );
  return row ?? null;
}

/** The `tb_photo` columns the read endpoints answer (all but `album_id`). */
const photoJson = {
  content_id: photo.content_id,
  file_path: photo.file_path,
  thumbnail_path: photo.thumbnail_path,
  img_url: photo.img_url,
  thumbnail_url: photo.thumbnail_url,
  location: photo.location,
  camera: photo.camera,
  lens: photo.lens,
  exposure_time: photo.exposure_time,
  focal_length: photo.focal_length,
  f_stop: photo.f_stop,
  iso: photo.iso,
  date: photo.date,
};

/** A photo's content with its `photo` details. */
const photoContentJson = { ...contentJson, photo: photoJson };

export type Direction = 'prev' | 'next';

/**
 * The comparison and order that find the nearest content id before (prev)
 * or after (next) `contentId`.
 */
function step(contentId: number, direction: Direction) {
  return direction === 'prev'
    ? {
        beyond: lt(content.content_id, contentId),
        order: desc(content.content_id),
      }
    : {
        beyond: gt(content.content_id, contentId),
        order: asc(content.content_id),
      };
}

/**
 * The (not deleted) photo with its details, author and board, or null. Its
 * author shows even after leaving the club.
 */
export async function findDetail(
  photoId: string | number,
  executor: Executor = database,
) {
  const id = parseId(photoId);
  if (id === null) {
    return null;
  }
  const [row] = await executor
    .select({
      ...photoContentJson,
      user: authorJson,
      board: {
        board_id: board.board_id,
        board_name: board.board_name,
        lv_read: board.lv_read,
      },
    })
    .from(content)
    .innerJoin(photo, eq(photo.content_id, content.content_id))
    .innerJoin(user, eq(user.user_id, content.author_id))
    .innerJoin(board, eq(board.board_id, content.board_id))
    .where(and(eq(content.content_id, id), isNull(content.deleted_at)));
  return row ?? null;
}

/** The album's (not deleted) photos, newest first, with the author's name. */
export async function listInAlbum(
  albumId: number,
  executor: Executor = database,
) {
  return executor
    .select({
      ...photoContentJson,
      user: { nickname: user.nickname, deleted_at: user.deleted_at },
    })
    .from(content)
    .innerJoin(photo, eq(photo.content_id, content.content_id))
    .innerJoin(user, eq(user.user_id, content.author_id))
    .where(and(eq(content.parent_id, albumId), isNull(content.deleted_at)))
    .orderBy(desc(content.created_at), desc(content.content_id));
}

/**
 * The board's newest (not deleted) photos, with the author's name, for the
 * home page.
 */
export async function listNewestOnBoard(
  boardId: string,
  limit: number,
  executor: Executor = database,
) {
  return executor
    .select({
      ...photoContentJson,
      user: { nickname: user.nickname, deleted_at: user.deleted_at },
    })
    .from(content)
    .innerJoin(photo, eq(photo.content_id, content.content_id))
    .innerJoin(user, eq(user.user_id, content.author_id))
    .where(and(eq(content.board_id, boardId), isNull(content.deleted_at)))
    .orderBy(desc(content.created_at), desc(content.content_id))
    .limit(limit);
}

/**
 * The nearest (not deleted) photo before or after the photo in the same
 * album, or, for a photo outside any album, among the board's photos
 * outside any album. Null at either end.
 */
export async function findNeighbourInAlbum(
  target: {
    content_id: number;
    parent_id: number | null;
    board_id: string | null;
  },
  direction: Direction,
  executor: Executor = database,
) {
  const { beyond, order } = step(target.content_id, direction);
  const sameAlbum =
    target.parent_id === null
      ? and(
          isNull(content.parent_id),
          target.board_id === null
            ? isNull(content.board_id)
            : eq(content.board_id, target.board_id),
        )
      : eq(content.parent_id, target.parent_id);
  const [row] = await executor
    .select(photoContentJson)
    .from(content)
    .innerJoin(photo, eq(photo.content_id, content.content_id))
    .where(and(sameAlbum, beyond, isNull(content.deleted_at)))
    .orderBy(order)
    .limit(1);
  return row ?? null;
}

/**
 * The author's nearest (not deleted) photo before or after the photo, on
 * the boards whose read level allows `readGrade`. Null at either end.
 */
export async function findNeighbourByAuthor(
  photoId: number,
  authorId: number,
  readGrade: number,
  direction: Direction,
  executor: Executor = database,
) {
  const { beyond, order } = step(photoId, direction);
  const [row] = await executor
    .select(photoContentJson)
    .from(content)
    .innerJoin(photo, eq(photo.content_id, content.content_id))
    .innerJoin(board, eq(board.board_id, content.board_id))
    .where(
      and(
        eq(content.author_id, authorId),
        eq(content.type, ContentTypeEnum.PHOTO),
        beyond,
        gte(board.lv_read, readGrade),
        isNull(content.deleted_at),
      ),
    )
    .orderBy(order)
    .limit(1);
  return row ?? null;
}

/**
 * The newest (not deleted) photo of the board's nearest album before or
 * after the album, by album id. Null at either end.
 */
export async function findInNeighbourAlbum(
  albumId: number,
  boardId: string,
  direction: Direction,
  executor: Executor = database,
) {
  const isPrev = direction === 'prev';
  const [row] = await executor
    .select(photoContentJson)
    .from(content)
    .innerJoin(photo, eq(photo.content_id, content.content_id))
    .where(
      and(
        isPrev
          ? lt(content.parent_id, albumId)
          : gt(content.parent_id, albumId),
        eq(content.board_id, boardId),
        isNull(content.deleted_at),
      ),
    )
    .orderBy(
      isPrev ? desc(content.parent_id) : asc(content.parent_id),
      desc(content.content_id),
    )
    .limit(1);
  return row ?? null;
}

/** The (not deleted) photos with these ids, in no particular order. */
export async function listByIds(ids: number[], executor: Executor = database) {
  if (ids.length === 0) {
    return [];
  }
  return executor
    .select(photoContentJson)
    .from(content)
    .innerJoin(photo, eq(photo.content_id, content.content_id))
    .where(and(inArray(content.content_id, ids), isNull(content.deleted_at)));
}

/** Each album's newest (not deleted) photo, by id, for albums that have one. */
export async function listLatestInAlbums(
  albumIds: number[],
  executor: Executor = database,
) {
  if (albumIds.length === 0) {
    return [];
  }
  return executor
    .selectDistinctOn([content.parent_id], photoContentJson)
    .from(content)
    .innerJoin(photo, eq(photo.content_id, content.content_id))
    .where(
      and(inArray(content.parent_id, albumIds), isNull(content.deleted_at)),
    )
    .orderBy(content.parent_id, desc(content.content_id));
}

export type PhotoFilter = {
  /** Only boards whose read level allows this grade. */
  readGrade: number;
  boardId?: string;
  authorId?: number;
  /** Photos with any of these tags. */
  tagIds?: string[];
  /** 'title', 'text', 'all' (title or text) or 'user' (nickname). */
  searchType?: string;
  searchKeyword?: string;
};

function listWhere(filter: PhotoFilter) {
  return and(
    eq(content.type, ContentTypeEnum.PHOTO),
    isNull(content.deleted_at),
    gte(board.lv_read, filter.readGrade),
    filter.boardId ? eq(content.board_id, filter.boardId) : undefined,
    filter.authorId !== undefined
      ? eq(content.author_id, filter.authorId)
      : undefined,
    filter.tagIds
      ? exists(
          database
            .select({ tag_id: contentTag.tag_id })
            .from(contentTag)
            .where(
              and(
                eq(contentTag.content_id, content.content_id),
                inArray(contentTag.tag_id, filter.tagIds),
              ),
            ),
        )
      : undefined,
    searchCondition(filter.searchType, filter.searchKeyword),
  );
}

/**
 * The matching (not deleted) photos, newest first, with their details,
 * author name and board.
 */
export async function list(
  filter: PhotoFilter,
  page: { limit: number; offset: number },
  executor: Executor = database,
) {
  return executor
    .select({
      ...photoContentJson,
      user: { nickname: user.nickname },
      board: { board_id: board.board_id, board_name: board.board_name },
    })
    .from(content)
    .innerJoin(photo, eq(photo.content_id, content.content_id))
    .innerJoin(user, eq(user.user_id, content.author_id))
    .innerJoin(board, eq(board.board_id, content.board_id))
    .where(listWhere(filter))
    .orderBy(desc(content.created_at), desc(content.content_id))
    .limit(page.limit)
    .offset(page.offset);
}

/** How many photos `list` finds without its page. */
export async function countList(
  filter: PhotoFilter,
  executor: Executor = database,
) {
  const [row] = await executor
    .select({ count: count() })
    .from(content)
    .innerJoin(photo, eq(photo.content_id, content.content_id))
    .innerJoin(user, eq(user.user_id, content.author_id))
    .innerJoin(board, eq(board.board_id, content.board_id))
    .where(listWhere(filter));
  return row.count;
}
