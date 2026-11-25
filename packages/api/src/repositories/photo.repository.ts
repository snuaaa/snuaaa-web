import { and, eq, isNull } from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { content, photo } from '../db/schema';
import ContentTypeEnum from '../enums/contentTypeEnum';

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
