import { asc, eq, gte, inArray } from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { board, category, tag } from '../db/schema';

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

/**
 * Adds each board's tags and categories, in the order the database returns
 * them, as Sequelize answered.
 */
async function withTagsAndCategories(
  boards: (typeof board.$inferSelect)[],
  executor: Executor,
) {
  const boardIds = boards.map((row) => row.board_id);
  if (boardIds.length === 0) {
    return [];
  }
  const [tags, categories] = await Promise.all([
    executor.select().from(tag).where(inArray(tag.board_id, boardIds)),
    executor
      .select()
      .from(category)
      .where(inArray(category.board_id, boardIds)),
  ]);
  return boards.map((row) => ({
    ...row,
    tags: tags.filter((item) => item.board_id === row.board_id),
    categories: categories.filter((item) => item.board_id === row.board_id),
  }));
}

/** The board with its tags and categories, or null for an unknown board. */
export async function findWithTagsAndCategories(
  boardId: string,
  executor: Executor = database,
) {
  const rows = await executor
    .select()
    .from(board)
    .where(eq(board.board_id, boardId));
  const [row] = await withTagsAndCategories(rows, executor);
  return row ?? null;
}

/**
 * The boards whose read level is at or above the grade, with their tags and
 * categories, in menu order.
 */
export async function listReadable(
  grade: number,
  executor: Executor = database,
) {
  const rows = await executor
    .select()
    .from(board)
    .where(gte(board.lv_read, grade))
    .orderBy(asc(board.menu), asc(board.order));
  return withTagsAndCategories(rows, executor);
}
