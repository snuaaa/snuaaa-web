import { desc, eq, sql } from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { officerGeneration, user, type OfficerRole } from '../db/schema';

export type OfficerInput = { president: string; roles: OfficerRole[] };

const columns = {
  generation: officerGeneration.generation,
  president: officerGeneration.president,
  roles: officerGeneration.roles,
  updated_at: officerGeneration.updated_at,
};

/** Every generation, newest first, with the 회장's account uuid (or null). */
export async function findAll(executor: Executor = database) {
  return executor
    .select({ ...columns, president_uuid: user.user_uuid })
    .from(officerGeneration)
    .leftJoin(user, eq(user.user_id, officerGeneration.president_user_id))
    .orderBy(desc(officerGeneration.generation));
}

/** Creates the generation, or replaces its 회장 and roles when it exists.
 *  The 회장's account stays as it was. */
export async function upsert(
  generation: number,
  { president, roles }: OfficerInput,
  executor: Executor = database,
) {
  const [row] = await executor
    .insert(officerGeneration)
    .values({ generation, president, roles })
    .onConflictDoUpdate({
      target: officerGeneration.generation,
      set: { president, roles, updated_at: sql`now()` },
    })
    .returning(columns);
  return row;
}

/** Starts a new generation with only its 회장, linked to their account.
 *  Null when the generation was added in the meantime. */
export async function insertWithPresident(
  generation: number,
  president: string,
  presidentUserId: number,
  executor: Executor = database,
) {
  const [row] = await executor
    .insert(officerGeneration)
    .values({
      generation,
      president,
      president_user_id: presidentUserId,
      roles: [],
    })
    .onConflictDoNothing({ target: officerGeneration.generation })
    .returning(columns);
  return row ?? null;
}

/** Deletes the generation. Returns how many rows were deleted (0 or 1). */
export async function remove(
  generation: number,
  executor: Executor = database,
) {
  const rows = await executor
    .delete(officerGeneration)
    .where(eq(officerGeneration.generation, generation))
    .returning({ generation: officerGeneration.generation });
  return rows.length;
}

/**
 * The newest 기수 with its 회장, or null when there is none. `lock` holds
 * the row until the transaction ends, so two 회기 넘기기 can't both start
 * the same next 기수.
 */
export async function findLatest(
  { lock = false }: { lock?: boolean } = {},
  executor: Executor = database,
) {
  const query = executor
    .select({
      generation: officerGeneration.generation,
      president: officerGeneration.president,
      president_user_id: officerGeneration.president_user_id,
    })
    .from(officerGeneration)
    .orderBy(desc(officerGeneration.generation))
    .limit(1);
  const [row] = await (lock ? query.for('update') : query);
  return row ?? null;
}
