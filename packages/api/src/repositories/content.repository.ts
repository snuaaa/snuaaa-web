import { eq, sql } from 'drizzle-orm';
import { database, type Executor, type Transaction } from '../db/client';
import { content } from '../db/schema';
import { parseId } from './utils';

/**
 * Adds `by` (negative to subtract) to one of the content's counters, without
 * touching `updated_at`.
 */
export async function addToCounter(
  contentId: number,
  counter: 'comment_num' | 'like_num',
  by: number,
  executor: Executor = database,
) {
  await executor
    .update(content)
    .set({ [counter]: sql`coalesce(${content[counter]}, 0) + ${by}` })
    .where(eq(content.content_id, contentId));
}

/**
 * Locks the content's row until `transaction` ends, so requests that change
 * the same content (e.g. like toggles) run one after another. Returns whether the
 * content exists, deleted ones included.
 */
export async function lock(
  contentId: string | number,
  transaction: Transaction,
) {
  const id = parseId(contentId);
  if (id === null) {
    return false;
  }
  const rows = await transaction
    .select({ content_id: content.content_id })
    .from(content)
    .where(eq(content.content_id, id))
    .for('update');
  return rows.length > 0;
}
