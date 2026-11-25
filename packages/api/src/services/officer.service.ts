import { AuthorizationError, NotFoundError } from '../errors';
import { withTransaction } from '../db/transaction';
import * as officers from '../repositories/officer.repository';
import type { Actor } from './types';

/** 운영진 (지구, 3) and above may add, change or delete any 기수. */
export const OFFICER_MANAGER_GRADE = 3;
/** 현 회장 (목성, 5) may only edit the current 기수, or add the next one. */
export const PRESIDENT_GRADE = 5;

function deny(): never {
  throw new AuthorizationError('Permission denied', { code: 4001 });
}

/**
 * Whether the actor may create or change `generation`, given the newest
 * 기수 so far. 운영진 and above may change any. 현 회장 may change the
 * newest one, or add the one right after it (the next term's 회장 enters
 * their own 기수); with no 기수 yet, any.
 */
export function canSaveGeneration(
  grade: number,
  generation: number,
  latest: number | null,
) {
  if (grade <= OFFICER_MANAGER_GRADE) return true;
  if (grade !== PRESIDENT_GRADE) return false;
  return latest === null || generation === latest || generation === latest + 1;
}

/** Every generation's officers, newest generation first. Any signed-in
 * user may read them, whatever their grade. */
export async function listOfficers() {
  return officers.findAll();
}

/** Creates the generation, or replaces its 회장 and all of its roles. */
export async function saveOfficers(
  actor: Actor,
  generation: number,
  input: officers.OfficerInput,
) {
  if (actor.grade > OFFICER_MANAGER_GRADE && actor.grade !== PRESIDENT_GRADE) {
    deny();
  }
  return withTransaction(async (transaction) => {
    const latest = await officers.findLatestGeneration(transaction);
    if (!canSaveGeneration(actor.grade, generation, latest)) deny();
    return officers.upsert(generation, input, transaction);
  });
}

/** Deletes the generation (운영진 and above); 404 when there is none. */
export async function deleteOfficers(actor: Actor, generation: number) {
  if (actor.grade > OFFICER_MANAGER_GRADE) deny();
  if ((await officers.remove(generation)) === 0) {
    throw new NotFoundError('Officer generation not found');
  }
}
