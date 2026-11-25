import { eq } from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { exhibition } from '../db/schema';

/** The details an exhibition stores next to its content row. */
export type ExhibitionFields = {
  exhibition_no?: number | null;
  slogan?: string | null;
  date_start?: Date | null;
  date_end?: Date | null;
  place?: string | null;
};

/** The poster's S3 URLs, original and thumbnail. */
export type PosterUrls = { url: string; thumbnailUrl: string };

/** The poster columns, with the legacy path columns holding the same URLs. */
function posterColumns(poster: PosterUrls) {
  return {
    poster_path: poster.url,
    poster_thumbnail_path: poster.thumbnailUrl,
    poster_url: poster.url,
    poster_thumbnail_url: poster.thumbnailUrl,
  };
}

/** Adds the `tb_exhibition` detail row of a content. */
export async function insert(
  contentId: number,
  fields: ExhibitionFields,
  poster: PosterUrls,
  executor: Executor = database,
) {
  await executor.insert(exhibition).values({
    content_id: contentId,
    exhibition_no: fields.exhibition_no ?? null,
    slogan: fields.slogan ?? null,
    date_start: fields.date_start ?? null,
    date_end: fields.date_end ?? null,
    place: fields.place ?? null,
    ...posterColumns(poster),
  });
}

/**
 * Changes the details that are given (undefined ones stay), and the poster
 * when a new one is given.
 */
export async function update(
  contentId: number,
  fields: ExhibitionFields,
  poster?: PosterUrls,
  executor: Executor = database,
) {
  const values = {
    ...Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value !== undefined),
    ),
    ...(poster ? posterColumns(poster) : {}),
  };
  if (Object.keys(values).length === 0) {
    return;
  }
  await executor
    .update(exhibition)
    .set(values)
    .where(eq(exhibition.content_id, contentId));
}
