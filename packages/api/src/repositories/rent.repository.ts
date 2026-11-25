import {
  and,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  lt,
  type SQL,
} from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { equipment, rent, rentReturn, user } from '../db/schema';
import { equipmentJson } from './equipment.repository';
import { authorJson } from './user.repository';

/** Whether the equipment has a rent that isn't returned. */
export async function hasOpenRent(
  equipmentId: number,
  executor: Executor = database,
) {
  const rows = await executor
    .select({ id: rent.id })
    .from(rent)
    .where(and(eq(rent.equipment_id, equipmentId), eq(rent.returned, false)))
    .limit(1);
  return rows.length > 0;
}

/**
 * The latest rent that isn't returned of each of the equipment, with its
 * renter (shown even after leaving the club; null when the account is gone).
 */
export async function listOpen(
  equipmentIds: number[],
  executor: Executor = database,
) {
  if (equipmentIds.length === 0) {
    return [];
  }
  return executor
    .selectDistinctOn([rent.equipment_id], {
      equipment_id: rent.equipment_id,
      start_date: rent.start_date,
      end_date: rent.end_date,
      user: authorJson,
    })
    .from(rent)
    .leftJoin(user, eq(user.user_id, rent.user_id))
    .where(
      and(inArray(rent.equipment_id, equipmentIds), eq(rent.returned, false)),
    )
    .orderBy(rent.equipment_id, desc(rent.start_date), desc(rent.id));
}

/** Adds a rent that isn't returned. */
export async function insert(
  values: {
    user_id: number;
    equipment_id: number;
    start_date: Date;
    end_date: Date;
  },
  executor: Executor = database,
) {
  await executor.insert(rent).values({ ...values, returned: false });
}

/** The rent, or null. Its row stays locked until the transaction ends. */
export async function lock(rentId: number, executor: Executor) {
  const [row] = await executor
    .select({
      user_id: rent.user_id,
      equipment_id: rent.equipment_id,
      end_date: rent.end_date,
      returned: rent.returned,
    })
    .from(rent)
    .where(eq(rent.id, rentId))
    .for('update');
  return row ?? null;
}

/** Marks the rent returned and records its return. */
export async function markReturned(
  rentId: number,
  values: {
    photo_path?: string | null;
    return_date: Date;
    penalty_status: string;
  },
  executor: Executor = database,
) {
  await executor
    .update(rent)
    .set({ returned: true })
    .where(eq(rent.id, rentId));
  await executor.insert(rentReturn).values({ rent_id: rentId, ...values });
}

/** The actor's rents that aren't returned, with their (not deleted) equipment. */
export async function listOpenOfUser(
  userId: number,
  executor: Executor = database,
) {
  return executor
    .select({
      id: rent.id,
      start_date: rent.start_date,
      end_date: rent.end_date,
      equipment: equipmentJson,
    })
    .from(rent)
    .innerJoin(equipment, eq(equipment.id, rent.equipment_id))
    .where(
      and(
        eq(rent.user_id, userId),
        eq(rent.returned, false),
        isNull(equipment.deleted_at),
      ),
    )
    .orderBy(rent.start_date, rent.id);
}

const rentReturnJson = {
  rent_id: rentReturn.rent_id,
  photo_path: rentReturn.photo_path,
  return_date: rentReturn.return_date,
  penalty_status: rentReturn.penalty_status,
};

/** A rent as the records answer it: its return (null when none) and renter. */
const recordJson = {
  id: rent.id,
  start_date: rent.start_date,
  end_date: rent.end_date,
  rentReturn: rentReturnJson,
  user: authorJson,
};

export type Page = { limit: number; offset: number };

/**
 * A page of the equipment's rents, newest first, and how many there are.
 * Renters show even after leaving the club.
 */
export async function listOfEquipment(
  equipmentId: number,
  page: Page,
  executor: Executor = database,
) {
  const where = eq(rent.equipment_id, equipmentId);
  const [rows, [total]] = await Promise.all([
    executor
      .select(recordJson)
      .from(rent)
      .leftJoin(rentReturn, eq(rentReturn.rent_id, rent.id))
      .innerJoin(user, eq(user.user_id, rent.user_id))
      .where(where)
      .orderBy(desc(rent.start_date), desc(rent.id))
      .limit(page.limit)
      .offset(page.offset),
    executor
      .select({ count: count() })
      .from(rent)
      .innerJoin(user, eq(user.user_id, rent.user_id))
      .where(where),
  ]);
  return { count: total.count, rows };
}

/** A time range; `from` is included and `until` is not. */
export type Range = { from?: Date; until?: Date };

export type RecordFilter = {
  penaltyStatus?: string;
  start?: Range;
  returned?: Range;
};

function within(
  column: typeof rent.start_date | typeof rentReturn.return_date,
  range?: Range,
): SQL[] {
  return [
    ...(range?.from ? [gte(column, range.from)] : []),
    ...(range?.until ? [lt(column, range.until)] : []),
  ];
}

/**
 * A page of the returned rents that match, newest first, with their return,
 * renter and equipment (deleted ones too), and how many there are.
 */
export async function listRecords(
  filter: RecordFilter,
  page: Page,
  executor: Executor = database,
) {
  const where = and(
    eq(rent.returned, true),
    filter.penaltyStatus
      ? eq(rentReturn.penalty_status, filter.penaltyStatus)
      : undefined,
    ...within(rent.start_date, filter.start),
    ...within(rentReturn.return_date, filter.returned),
  );
  const [rows, [total]] = await Promise.all([
    executor
      .select({
        ...recordJson,
        equipment: {
          id: equipment.id,
          name: equipment.name,
          nickname: equipment.nickname,
        },
      })
      .from(rent)
      .leftJoin(rentReturn, eq(rentReturn.rent_id, rent.id))
      .innerJoin(user, eq(user.user_id, rent.user_id))
      .innerJoin(equipment, eq(equipment.id, rent.equipment_id))
      .where(where)
      .orderBy(desc(rent.start_date), desc(rent.id))
      .limit(page.limit)
      .offset(page.offset),
    executor
      .select({ count: count() })
      .from(rent)
      .leftJoin(rentReturn, eq(rentReturn.rent_id, rent.id))
      .innerJoin(user, eq(user.user_id, rent.user_id))
      .innerJoin(equipment, eq(equipment.id, rent.equipment_id))
      .where(where),
  ]);
  return { count: total.count, rows };
}

/** The rent's return, or null. Its row stays locked until the transaction ends. */
export async function lockReturn(rentId: number, executor: Executor) {
  const [row] = await executor
    .select(rentReturnJson)
    .from(rentReturn)
    .where(eq(rentReturn.rent_id, rentId))
    .for('update');
  return row ?? null;
}

/** Sets the penalty status of the rent's return and returns the return. */
export async function setPenaltyStatus(
  rentId: number,
  penaltyStatus: string,
  executor: Executor = database,
) {
  const [row] = await executor
    .update(rentReturn)
    .set({ penalty_status: penaltyStatus })
    .where(eq(rentReturn.rent_id, rentId))
    .returning(rentReturnJson);
  return row;
}
