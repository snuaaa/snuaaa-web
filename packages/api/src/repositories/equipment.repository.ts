import { and, asc, count, eq, isNull, like } from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { equipment } from '../db/schema';

/** The details an admin sets on an equipment. */
export type EquipmentFields = {
  category_id?: number | null;
  name?: string | null;
  nickname?: string | null;
  description?: string | null;
  location?: string | null;
  maker?: string | null;
  status?: string | null;
  img_path?: string | null;
};

/** The equipment as the web reads it, with Sequelize's timestamp names. */
const equipmentJson = {
  id: equipment.id,
  category_id: equipment.category_id,
  name: equipment.name,
  nickname: equipment.nickname,
  description: equipment.description,
  location: equipment.location,
  maker: equipment.maker,
  status: equipment.status,
  rent_status: equipment.rent_status,
  img_path: equipment.img_path,
  createdAt: equipment.created_at,
  updatedAt: equipment.updated_at,
  deletedAt: equipment.deleted_at,
};

export type EquipmentFilter = {
  categoryId?: number;
  status?: string;
  /** A case-sensitive part of the name. */
  keyword?: string;
};

/** The matching (not deleted) equipment, by category, then id. */
export async function list(
  filter: EquipmentFilter = {},
  executor: Executor = database,
) {
  return executor
    .select(equipmentJson)
    .from(equipment)
    .where(
      and(
        isNull(equipment.deleted_at),
        filter.categoryId === undefined
          ? undefined
          : eq(equipment.category_id, filter.categoryId),
        filter.status ? eq(equipment.status, filter.status) : undefined,
        filter.keyword
          ? like(equipment.name, `%${filter.keyword}%`)
          : undefined,
      ),
    )
    .orderBy(asc(equipment.category_id), asc(equipment.id));
}

/**
 * The (not deleted) equipment's id, or null. With `lock`, its row stays
 * locked until the transaction ends, so a concurrent change waits.
 */
export async function findId(
  id: number,
  { lock = false } = {},
  executor: Executor = database,
) {
  const query = executor
    .select({ id: equipment.id })
    .from(equipment)
    .where(and(eq(equipment.id, id), isNull(equipment.deleted_at)));
  const [row] = await (lock ? query.for('update') : query);
  return row?.id ?? null;
}

/** Adds an equipment and returns it. */
export async function insert(
  fields: EquipmentFields & { rent_status?: string },
  executor: Executor = database,
) {
  const now = new Date();
  const [row] = await executor
    .insert(equipment)
    .values({ ...fields, created_at: now, updated_at: now })
    .returning(equipmentJson);
  return row;
}

/** Changes the given fields (undefined ones stay). */
export async function update(
  id: number,
  fields: EquipmentFields & { rent_status?: string },
  executor: Executor = database,
) {
  await executor
    .update(equipment)
    .set({ ...fields, updated_at: new Date() })
    .where(eq(equipment.id, id));
}

/** Soft-deletes the equipment. Returns how many rows changed (0 or 1). */
export async function softDelete(id: number, executor: Executor = database) {
  const rows = await executor
    .update(equipment)
    .set({ deleted_at: new Date() })
    .where(and(eq(equipment.id, id), isNull(equipment.deleted_at)))
    .returning({ id: equipment.id });
  return rows.length;
}

/** How many (not deleted) equipment are in the category. */
export async function countInCategory(
  categoryId: number,
  executor: Executor = database,
) {
  const [row] = await executor
    .select({ count: count() })
    .from(equipment)
    .where(
      and(eq(equipment.category_id, categoryId), isNull(equipment.deleted_at)),
    );
  return row.count;
}
