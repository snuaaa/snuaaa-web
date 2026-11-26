import { and, eq, inArray } from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { contentTag } from '../db/schema';

/** The ids of the tags on the content. */
export async function listTagIds(
  contentId: number,
  executor: Executor = database,
) {
  const rows = await executor
    .select({ tag_id: contentTag.tag_id })
    .from(contentTag)
    .where(eq(contentTag.content_id, contentId));
  return rows.map((row) => row.tag_id);
}

/** Puts the tags on the content. An unknown tag id fails (foreign key). */
export async function add(
  contentId: number,
  tagIds: string[],
  executor: Executor = database,
) {
  if (tagIds.length === 0) {
    return;
  }
  await executor
    .insert(contentTag)
    .values(tagIds.map((tagId) => ({ content_id: contentId, tag_id: tagId })));
}

/** Takes the tags off the content. */
export async function remove(
  contentId: number,
  tagIds: string[],
  executor: Executor = database,
) {
  if (tagIds.length === 0) {
    return;
  }
  await executor
    .delete(contentTag)
    .where(
      and(
        eq(contentTag.content_id, contentId),
        inArray(contentTag.tag_id, tagIds),
      ),
    );
}
