import { eq } from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { category } from '../db/schema';

/** The board's categories, in the order the database returns them. */
export async function listOnBoard(
  boardId: string,
  executor: Executor = database,
) {
  return executor.select().from(category).where(eq(category.board_id, boardId));
}
