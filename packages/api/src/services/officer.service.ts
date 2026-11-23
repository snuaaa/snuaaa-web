import { AuthorizationError, NotFoundError } from '../errors';
import type { OfficerRole } from '../db/schema';
import * as officers from '../repositories/officer.repository';
import type { Actor } from './types';

/** Members (해왕성, 8) and above may read the list; 비회원 and guests not. */
export const OFFICER_READ_GRADE = 8;
/** 임원진 (토성, 6) and above may add, change or delete generations. */
export const OFFICER_EDIT_GRADE = 6;

function assertGrade(actor: Actor, grade: number) {
  if (actor.grade > grade) {
    throw new AuthorizationError('Permission denied', { code: 4001 });
  }
}

/** Every generation's officers, newest generation first. */
export async function listOfficers(actor: Actor) {
  assertGrade(actor, OFFICER_READ_GRADE);
  return officers.findAll();
}

/** Creates the generation, or replaces all of its roles. */
export async function saveOfficers(
  actor: Actor,
  generation: number,
  roles: OfficerRole[],
) {
  assertGrade(actor, OFFICER_EDIT_GRADE);
  return officers.upsert(generation, roles);
}

/** Deletes the generation; 404 when there is none. */
export async function deleteOfficers(actor: Actor, generation: number) {
  assertGrade(actor, OFFICER_EDIT_GRADE);
  if ((await officers.remove(generation)) === 0) {
    throw new NotFoundError('Officer generation not found');
  }
}
