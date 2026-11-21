import { eq } from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { document } from '../db/schema';

/** Adds the `tb_document` detail row of a content. */
export async function insert(
  contentId: number,
  generation: number | null,
  executor: Executor = database,
) {
  await executor.insert(document).values({ content_id: contentId, generation });
}

/**
 * Removes the `tb_document` row. Deleting a document has always removed this
 * row for good while only soft-deleting its content.
 */
export async function remove(contentId: number, executor: Executor = database) {
  await executor.delete(document).where(eq(document.content_id, contentId));
}
