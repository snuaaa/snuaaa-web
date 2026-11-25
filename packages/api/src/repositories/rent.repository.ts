import { and, desc, eq, inArray } from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { rent, user } from '../db/schema';
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
