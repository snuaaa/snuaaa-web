import { eq } from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { board } from '../db/schema';

/** The board's permission levels, or null for an unknown board. */
export async function findLevels(
  boardId: string,
  executor: Executor = database,
) {
  const [row] = await executor
    .select({
      board_id: board.board_id,
      lv_read: board.lv_read,
      lv_write: board.lv_write,
      lv_edit: board.lv_edit,
    })
    .from(board)
    .where(eq(board.board_id, boardId));
  return row ?? null;
}
