import { withTransaction } from '../db/transaction';
import { AuthorizationError, BadRequestError, NotFoundError } from '../errors';
import * as users from '../repositories/user.repository';
import type { Actor } from './types';

/** Grades a member can hold. There is no grade 2; 1 is the most privileged. */
export const USER_GRADES = [1, 3, 4, 5, 6, 7, 8, 9] as const;

/** The least privileged grade that may change other members' grades. */
export const GRADE_MANAGER_GRADE = 3;

/** A new member's grade, until they give a club number. */
export const NEW_MEMBER_GRADE = 9;
/** A member's grade once they gave a club number. */
export const MEMBER_GRADE = 8;

export const NICKNAME_MAX_LENGTH = 16;

/**
 * The two digits of the generation in a club number (`23AAA-12` or
 * `AAA23-12`), or null when it isn't one.
 */
export function generationOf(clubNumber: string | null | undefined) {
  if (clubNumber && /^[0-9]{2}[Aa]{3}-[0-9]{1,3}$/.test(clubNumber)) {
    return clubNumber.slice(0, 2);
  }
  if (clubNumber && /^[Aa]{3}[0-9]{2}-[0-9]{1,3}$/.test(clubNumber)) {
    return clubNumber.slice(3, 5);
  }
  return null;
}

/**
 * The name shown to other members: the name, after the two digits of the
 * generation when the club number has one.
 */
function nicknameOf(clubNumber: string | null | undefined, name: string) {
  return (generationOf(clubNumber) ?? '') + name;
}

export type ProfileInput = Omit<users.ProfileFields, 'nickname' | 'grade'>;

/**
 * Saves the actor's own profile; fields left `undefined` stay. The nickname
 * follows the name and the club number. A new member (grade 9) who gives
 * any club number becomes a member (grade 8); other grades stay. Throws 404
 * when the actor left, and 400 when the nickname would be too long.
 */
export async function updateMyProfile(actor: Actor, input: ProfileInput) {
  const current = await users.findGrade(actor._id);
  if (!current) {
    throw new NotFoundError('id is not correct');
  }
  let nickname: string | undefined;
  if (typeof input.username === 'string') {
    nickname = nicknameOf(input.aaa_no, input.username);
    if (nickname.length > NICKNAME_MAX_LENGTH) {
      throw new BadRequestError('username is too long');
    }
  }
  const previousGrade = current.grade ?? NEW_MEMBER_GRADE;
  const grade =
    previousGrade < NEW_MEMBER_GRADE
      ? previousGrade
      : input.aaa_no
        ? MEMBER_GRADE
        : NEW_MEMBER_GRADE;
  await users.updateProfile(actor._id, { ...input, nickname, grade });
}

/**
 * Changes another member's grade. The actor must be grade 1–3, the target
 * must currently have a lower grade (a larger number) than the actor, and
 * the new grade must also be lower than the actor's. The actor's grade is
 * read from the database, since the one in the token can be stale.
 */
export async function changeGrade(
  actor: Actor,
  targetUuid: string,
  grade: number,
) {
  if (!Number.isInteger(grade) || !USER_GRADES.includes(grade as never)) {
    throw new BadRequestError('grade is not valid');
  }
  await withTransaction(async (transaction) => {
    // Locked, so a concurrent change to either grade can't slip in between
    // the checks and the update.
    const { manager, target } = await users.lockGradesForChange(
      actor._id,
      targetUuid,
      transaction,
    );
    if (!manager) {
      throw new NotFoundError('user not found');
    }
    const managerGrade = manager.grade ?? NEW_MEMBER_GRADE;
    if (managerGrade > GRADE_MANAGER_GRADE) {
      throw new AuthorizationError('only grade 1-3 can change grades');
    }
    if (!target) {
      throw new NotFoundError('user not found');
    }
    if ((target.grade ?? NEW_MEMBER_GRADE) <= managerGrade) {
      throw new AuthorizationError(
        "can only change members with a lower grade than one's own",
      );
    }
    if (grade <= managerGrade) {
      throw new AuthorizationError("can only set a grade lower than one's own");
    }
    await users.updateProfile(target.user_id, { grade }, transaction);
  });
}

/** The least privileged grade that may see the member list. */
const MEMBER_LIST_GRADE = 6;
const MEMBERS_PER_PAGE = 20;
const SEARCH_RESULT_COUNT = 5;

/** The actor's own info. Throws 404 when they left. */
export async function retrieveMyInfo(actor: Actor) {
  const info = await users.findOwnInfo(actor._id);
  if (!info) {
    throw new NotFoundError('id is not correct');
  }
  return info;
}

/** Another member's profile, or null for an unknown member. */
export async function retrieveMemberProfile(userUuid: string) {
  return users.findProfileByUuid(userUuid);
}

export type MemberListQuery = {
  /** A column the list can sort by; anything else sorts by `user_id`. */
  sort?: string;
  /** 'ASC', or anything else for descending. */
  order?: string;
  limit?: number;
  offset?: number;
};

/** A page of the members, and how many there are, for staff (grade 1–6). */
export async function listMembers(actor: Actor, query: MemberListQuery) {
  if (actor.grade > MEMBER_LIST_GRADE) {
    throw new AuthorizationError();
  }
  const column =
    query.sort && Object.hasOwn(users.MEMBER_SORT_COLUMNS, query.sort)
      ? (query.sort as users.MemberSort)
      : 'user_id';
  const [count, rows] = await Promise.all([
    users.countAll(),
    users.list(
      { column, ascending: query.order === 'ASC' },
      {
        limit: query.limit ?? MEMBERS_PER_PAGE,
        offset: query.offset ?? 0,
      },
    ),
  ]);
  return { userInfo: rows, count };
}

/** The first few members whose name contains the text. */
export async function searchMembers(name: string) {
  return users.searchByName(name, SEARCH_RESULT_COUNT);
}
