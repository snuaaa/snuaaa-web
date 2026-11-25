import {
  AuthorizationError,
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../errors';
import { withTransaction } from '../db/transaction';
import type { Executor } from '../db/client';
import * as officers from '../repositories/officer.repository';
import * as users from '../repositories/user.repository';
import type { Actor } from './types';

/** 운영진 (지구, 3) and above may add, change or delete any 기수. */
export const OFFICER_MANAGER_GRADE = 3;
/** 현 회장 (목성, 5) may edit their own 기수 and hand it over. */
export const PRESIDENT_GRADE = 5;
/** 전 회장 (화성, 4): what 현 회장 becomes after 회기 넘기기. */
export const FORMER_PRESIDENT_GRADE = 4;
/** 임원진 (토성, 6): every one of them becomes 천왕성 (7) after 회기 넘기기. */
export const OFFICER_GRADE = 6;
export const MEMBER_GRADE_AFTER_TERM = 7;
/** The least privileged grade that may become 회장: 해왕성 (8), a member
 *  with a club number. 명왕성 (9) is waiting for one. */
const LOWEST_PRESIDENT_CANDIDATE_GRADE = 8;
/** The largest 기수 number the routes accept. */
export const MAX_GENERATION = 9999;

type Latest = Awaited<ReturnType<typeof officers.findLatest>>;
type Member = NonNullable<Awaited<ReturnType<typeof users.findNameAndGrade>>>;

function deny(): never {
  throw new AuthorizationError('Permission denied', { code: 4001 });
}

/**
 * The actor as they are now in the DB: a token keeps the grade it was
 * signed with, and 회기 넘기기 changes grades.
 */
async function currentMember(actor: Actor, executor?: Executor) {
  return (await users.findNameAndGrade(actor._id, executor)) ?? deny();
}

const isManager = (member: Member) =>
  (member.grade ?? Infinity) <= OFFICER_MANAGER_GRADE;

/**
 * Whether the member is the 회장 of the newest 기수: grade 5, and the
 * account the 기수 was started with. A 기수 imported from the old site has
 * no account, so its 회장 is matched by name.
 */
export function isCurrentPresident(member: Member, latest: Latest) {
  if (member.grade !== PRESIDENT_GRADE || !latest) return false;
  return latest.president_user_id !== null
    ? latest.president_user_id === member.user_id
    : latest.president === member.username;
}

/** Every generation's officers, newest generation first. Any signed-in
 * user may read them, whatever their grade. */
export async function listOfficers() {
  return officers.findAll();
}

/**
 * Creates the generation, or replaces its 회장 and all of its roles.
 * 운영진 may save any 기수; 현 회장 only their own, the newest one. A new
 * 기수 otherwise starts with 회기 넘기기.
 */
export async function saveOfficers(
  actor: Actor,
  generation: number,
  input: officers.OfficerInput,
) {
  return withTransaction(async (transaction) => {
    const member = await currentMember(actor, transaction);
    if (!isManager(member)) {
      // Not locked: a 기수 added at the same moment only means 현 회장's
      // edit lands on the 기수 that was theirs a moment ago.
      const latest = await officers.findLatest({}, transaction);
      if (
        !isCurrentPresident(member, latest) ||
        generation !== latest?.generation
      ) {
        deny();
      }
    }
    return officers.upsert(generation, input, transaction);
  });
}

/**
 * 회기 넘기기: ends the newest 기수 and starts the next one with the given
 * member as 회장. 임원진 (토성, 6) become 천왕성 (7), 현 회장 (5) becomes
 * 전 회장 (4), and the new 회장 becomes 현 회장 (5), unless they are
 * 운영진, whose grade stays. The new
 * 기수 starts with no other roles; its 회장 fills them in. 운영진 or the
 * current 회장 may do it.
 */
export async function handOver(actor: Actor, presidentUuid: string) {
  return withTransaction(async (transaction) => {
    const member = await currentMember(actor, transaction);
    // Check without the lock first, so a member who may not hand over
    // can't hold the row; then lock it and check again.
    const allowed = (latest: Latest) =>
      isManager(member) || isCurrentPresident(member, latest);
    if (!allowed(await officers.findLatest({}, transaction))) deny();
    const latest = await officers.findLatest({ lock: true }, transaction);
    if (!allowed(latest)) deny();
    // A first 기수 is added by hand, so there is always a row to lock.
    if (!latest) throw new BadRequestError('There is no generation yet');
    if (latest.generation >= MAX_GENERATION) {
      throw new BadRequestError('The generation number is too large');
    }

    const president = await users.findNameAndGradeByUuid(
      presidentUuid,
      transaction,
    );
    if (!president) throw new NotFoundError('Member not found');
    if ((president.grade ?? Infinity) > LOWEST_PRESIDENT_CANDIDATE_GRADE) {
      throw new BadRequestError('The member is not a regular member');
    }
    const name = president.username?.trim();
    if (!name) throw new BadRequestError('The member has no name');

    await users.changeGradeOfAll(
      OFFICER_GRADE,
      MEMBER_GRADE_AFTER_TERM,
      transaction,
    );
    await users.changeGradeOfAll(
      PRESIDENT_GRADE,
      FORMER_PRESIDENT_GRADE,
      transaction,
    );
    if ((president.grade ?? Infinity) > OFFICER_MANAGER_GRADE) {
      await users.updateProfile(
        president.user_id,
        { grade: PRESIDENT_GRADE },
        transaction,
      );
    }
    const started = await officers.insertWithPresident(
      latest.generation + 1,
      name.slice(0, 32),
      president.user_id,
      transaction,
    );
    // 운영진 added the same 기수 by hand at the same moment: roll back.
    if (!started) throw new ConflictError('The generation already exists');
    return started;
  });
}

/** Deletes the generation (운영진 and above); 404 when there is none. */
export async function deleteOfficers(actor: Actor, generation: number) {
  if (!isManager(await currentMember(actor))) deny();
  if ((await officers.remove(generation)) === 0) {
    throw new NotFoundError('Officer generation not found');
  }
}
