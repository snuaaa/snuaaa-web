import { and, asc, eq, isNull } from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { equipmentCategory } from '../db/schema';

/** The (not deleted) categories, by id. */
export async function list(executor: Executor = database) {
  return executor
    .select({ id: equipmentCategory.id, name: equipmentCategory.name })
    .from(equipmentCategory)
    .where(isNull(equipmentCategory.deleted_at))
    .orderBy(asc(equipmentCategory.id));
}

/** Adds a category and returns it, with Sequelize's timestamp names. */
export async function insert(name: string, executor: Executor = database) {
  const now = new Date();
  const [row] = await executor
    .insert(equipmentCategory)
    .values({ name, created_at: now, updated_at: now })
    .returning({
      id: equipmentCategory.id,
      name: equipmentCategory.name,
      createdAt: equipmentCategory.created_at,
      updatedAt: equipmentCategory.updated_at,
      deletedAt: equipmentCategory.deleted_at,
    });
  return row;
}

const notDeleted = (id: number) =>
  and(eq(equipmentCategory.id, id), isNull(equipmentCategory.deleted_at));

/**
 * Whether the (not deleted) category exists. With `lock`, its row stays
 * locked until the transaction ends.
 */
export async function exists(
  id: number,
  { lock = false } = {},
  executor: Executor = database,
) {
  const query = executor
    .select({ id: equipmentCategory.id })
    .from(equipmentCategory)
    .where(notDeleted(id));
  const rows = await (lock ? query.for('update') : query);
  return rows.length > 0;
}

/** Renames the (not deleted) category. Returns how many rows changed. */
export async function rename(
  id: number,
  name: string,
  executor: Executor = database,
) {
  const rows = await executor
    .update(equipmentCategory)
    .set({ name, updated_at: new Date() })
    .where(notDeleted(id))
    .returning({ id: equipmentCategory.id });
  return rows.length;
}

/** Soft-deletes the category. Returns how many rows changed (0 or 1). */
export async function softDelete(id: number, executor: Executor = database) {
  const rows = await executor
    .update(equipmentCategory)
    .set({ deleted_at: new Date() })
    .where(notDeleted(id))
    .returning({ id: equipmentCategory.id });
  return rows.length;
}
