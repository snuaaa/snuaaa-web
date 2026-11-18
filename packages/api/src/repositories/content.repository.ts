import { eq, sql } from 'drizzle-orm';
import { db, type Executor, type Tx } from '../db/client';
import { content } from '../db/schema';
import { parseId } from './ids';

/**
 * Adds `by` (negative to subtract) to one of the content's counters, without
 * touching `updated_at`.
 */
export async function addToCounter(
  contentId: number,
  counter: 'comment_num' | 'like_num',
  by: number,
  ex: Executor = db,
) {
  await ex
    .update(content)
    .set({ [counter]: sql`coalesce(${content[counter]}, 0) + ${by}` })
    .where(eq(content.content_id, contentId));
}

/**
 * Locks the content's row until `tx` ends, so requests that change the same
 * content (e.g. like toggles) run one after another. Returns whether the
 * content exists, deleted ones included.
 */
export async function lock(contentId: string | number, tx: Tx) {
  const id = parseId(contentId);
  if (id === null) {
    return false;
  }
  const rows = await tx
    .select({ content_id: content.content_id })
    .from(content)
    .where(eq(content.content_id, id))
    .for('update');
  return rows.length > 0;
}
