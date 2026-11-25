import { and, asc, eq, isNull } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { database, type Executor } from '../db/client';
import { board, content, exhibitPhoto, user } from '../db/schema';
import { contentJson } from './content.repository';
import { authorJson } from './user.repository';
import { parseId } from './utils';

/** The details an exhibit photo stores next to its content row. */
export type ExhibitPhotoFields = {
  order?: number | null;
  photographer_id?: number | null;
  photographer_alt?: string | null;
  location?: string | null;
  camera?: string | null;
  lens?: string | null;
  exposure_time?: string | null;
  focal_length?: string | null;
  f_stop?: string | null;
  iso?: string | null;
  date?: Date | null;
};

/**
 * Adds the `tb_exhibit_photo` detail row of a content. The legacy path
 * columns hold the same URLs as the `*_url` ones.
 */
export async function insert(
  contentId: number,
  fields: ExhibitPhotoFields,
  image: { url: string; thumbnailUrl: string },
  executor: Executor = database,
) {
  await executor.insert(exhibitPhoto).values({
    content_id: contentId,
    order: fields.order ?? null,
    photographer_id: fields.photographer_id ?? null,
    photographer_alt: fields.photographer_alt ?? null,
    file_path: image.url,
    thumbnail_path: image.thumbnailUrl,
    img_url: image.url,
    thumbnail_url: image.thumbnailUrl,
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

/** Changes the details that are given (undefined ones stay). */
export async function update(
  contentId: number,
  fields: ExhibitPhotoFields,
  executor: Executor = database,
) {
  const values = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  );
  if (Object.keys(values).length === 0) {
    return;
  }
  await executor
    .update(exhibitPhoto)
    .set(values)
    .where(eq(exhibitPhoto.content_id, contentId));
}

/**
 * Removes the `tb_exhibit_photo` row. Deleting an exhibit photo has always
 * removed this row for good while only soft-deleting its content.
 */
export async function remove(contentId: number, executor: Executor = database) {
  await executor
    .delete(exhibitPhoto)
    .where(eq(exhibitPhoto.content_id, contentId));
}

/** The `tb_exhibit_photo` columns the read endpoints answer (all but `exhibition_id`). */
const exhibitPhotoJson = {
  content_id: exhibitPhoto.content_id,
  order: exhibitPhoto.order,
  photographer_id: exhibitPhoto.photographer_id,
  photographer_alt: exhibitPhoto.photographer_alt,
  file_path: exhibitPhoto.file_path,
  thumbnail_path: exhibitPhoto.thumbnail_path,
  img_url: exhibitPhoto.img_url,
  thumbnail_url: exhibitPhoto.thumbnail_url,
  location: exhibitPhoto.location,
  camera: exhibitPhoto.camera,
  lens: exhibitPhoto.lens,
  exposure_time: exhibitPhoto.exposure_time,
  focal_length: exhibitPhoto.focal_length,
  f_stop: exhibitPhoto.f_stop,
  iso: exhibitPhoto.iso,
  date: exhibitPhoto.date,
};

const photographer = alias(user, 'photographer');

/**
 * The (not deleted) exhibit photo with its details, its photographer (null
 * for a typed name), author and board, or null. The photographer and the
 * author show even after leaving the club.
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
      ...contentJson,
      exhibitPhoto: exhibitPhotoJson,
      photographer: {
        user_id: photographer.user_id,
        user_uuid: photographer.user_uuid,
        nickname: photographer.nickname,
        introduction: photographer.introduction,
        grade: photographer.grade,
        level: photographer.level,
        profile_path: photographer.profile_path,
        profile_url: photographer.profile_url,
        deleted_at: photographer.deleted_at,
      },
      user: authorJson,
      board: { board_id: board.board_id, lv_read: board.lv_read },
    })
    .from(content)
    .innerJoin(exhibitPhoto, eq(exhibitPhoto.content_id, content.content_id))
    .leftJoin(
      photographer,
      eq(photographer.user_id, exhibitPhoto.photographer_id),
    )
    .innerJoin(user, eq(user.user_id, content.author_id))
    .innerJoin(board, eq(board.board_id, content.board_id))
    .where(and(eq(content.content_id, id), isNull(content.deleted_at)));
  return row ?? null;
}

/**
 * The exhibition's (not deleted) photos with their details, by `order`, then
 * oldest first.
 */
export async function listInExhibition(
  exhibitionId: number,
  executor: Executor = database,
) {
  return executor
    .select({ ...contentJson, exhibitPhoto: exhibitPhotoJson })
    .from(content)
    .innerJoin(exhibitPhoto, eq(exhibitPhoto.content_id, content.content_id))
    .where(and(eq(content.parent_id, exhibitionId), isNull(content.deleted_at)))
    .orderBy(
      asc(exhibitPhoto.order),
      asc(content.created_at),
      asc(content.content_id),
    );
}
