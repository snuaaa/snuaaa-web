import { eq } from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { album } from '../db/schema';

/** Adds the `tb_album` detail row of a content. */
export async function insert(
  contentId: number,
  isPrivate: boolean | null,
  executor: Executor = database,
) {
  await executor
    .insert(album)
    .values({ content_id: contentId, is_private: isPrivate });
}

/** Changes `is_private` when it is given (undefined keeps it). */
export async function update(
  contentId: number,
  fields: { is_private?: boolean | null },
  executor: Executor = database,
) {
  if (fields.is_private === undefined) {
    return;
  }
  await executor
    .update(album)
    .set({ is_private: fields.is_private })
    .where(eq(album.content_id, contentId));
}

/** Makes the photo the album's cover. */
export async function setThumbnail(
  contentId: number,
  photoId: number,
  executor: Executor = database,
) {
  await executor
    .update(album)
    .set({ tn_photo_id: photoId })
    .where(eq(album.content_id, contentId));
}
