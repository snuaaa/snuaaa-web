import { eq } from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { exhibitPhoto } from '../db/schema';

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
