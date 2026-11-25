import { desc, eq, sql } from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { officerGeneration, type OfficerRole } from '../db/schema';

export type OfficerInput = { president: string; roles: OfficerRole[] };

const columns = {
  generation: officerGeneration.generation,
  president: officerGeneration.president,
  roles: officerGeneration.roles,
  updated_at: officerGeneration.updated_at,
};

/** Every generation, newest first. */
export async function findAll(executor: Executor = database) {
  return executor
    .select(columns)
    .from(officerGeneration)
    .orderBy(desc(officerGeneration.generation));
}

/** Creates the generation, or replaces its 회장 and roles when it exists. */
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

/** The newest 기수 number, or null when there is none. */
export async function findLatestGeneration(executor: Executor = database) {
  const [row] = await executor
    .select({ generation: officerGeneration.generation })
    .from(officerGeneration)
    .orderBy(desc(officerGeneration.generation))
    .limit(1);
  return row?.generation ?? null;
}
