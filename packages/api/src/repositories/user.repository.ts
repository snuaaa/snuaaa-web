import { and, asc, count, desc, eq, isNull, like, or } from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { statsLogin, user } from '../db/schema';

/** The author fields a content's detail shows (Sequelize's BASE_USER_FIELDS). */
export const authorJson = {
  user_id: user.user_id,
  user_uuid: user.user_uuid,
  nickname: user.nickname,
  introduction: user.introduction,
  grade: user.grade,
  level: user.level,
  profile_path: user.profile_path,
  profile_url: user.profile_url,
  deleted_at: user.deleted_at,
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The id of the (not deleted) user with the uuid, or null. */
export async function findIdByUuid(
  userUuid: string,
  executor: Executor = database,
) {
  if (!UUID.test(userUuid)) {
    return null;
  }
  const [row] = await executor
    .select({ user_id: user.user_id })
    .from(user)
    .where(and(eq(user.user_uuid, userUuid), isNull(user.deleted_at)));
  return row?.user_id ?? null;
}

/** The (not deleted) user's grade, or null. */
export async function findGrade(userId: number, executor: Executor = database) {
  const [row] = await executor
    .select({ user_id: user.user_id, grade: user.grade })
    .from(user)
    .where(and(eq(user.user_id, userId), isNull(user.deleted_at)));
  return row ?? null;
}

/**
 * Locks the rows of a grade change, the manager's and the target's, in
 * `user_id` order so two changes can't deadlock, and answers their grades.
 * A user who left or a malformed uuid is left out.
 */
export async function lockGradesForChange(
  managerId: number,
  targetUuid: string,
  executor: Executor,
) {
  const rows = await executor
    .select({
      user_id: user.user_id,
      user_uuid: user.user_uuid,
      grade: user.grade,
    })
    .from(user)
    .where(
      and(
        UUID.test(targetUuid)
          ? or(eq(user.user_id, managerId), eq(user.user_uuid, targetUuid))
          : eq(user.user_id, managerId),
        isNull(user.deleted_at),
      ),
    )
    .orderBy(asc(user.user_id))
    .for('update');
  return {
    manager: rows.find((row) => row.user_id === managerId) ?? null,
    // PostgreSQL answers uuids in lowercase, whatever case was asked.
    target:
      rows.find((row) => row.user_uuid === targetUuid.toLowerCase()) ?? null,
  };
}

/** The (not deleted) user's name and grade, or null. */
export async function findNameAndGrade(
  userId: number,
  executor: Executor = database,
) {
  const [row] = await executor
    .select({
      user_id: user.user_id,
      username: user.username,
      grade: user.grade,
    })
    .from(user)
    .where(and(eq(user.user_id, userId), isNull(user.deleted_at)));
  return row ?? null;
}

/** The (not deleted) user with the uuid, with their name and grade, or null. */
export async function findNameAndGradeByUuid(
  userUuid: string,
  executor: Executor = database,
) {
  if (!UUID.test(userUuid)) {
    return null;
  }
  const [row] = await executor
    .select({
      user_id: user.user_id,
      username: user.username,
      grade: user.grade,
    })
    .from(user)
    .where(and(eq(user.user_uuid, userUuid), isNull(user.deleted_at)));
  return row ?? null;
}

/** How many (not deleted) members of the grade have the name. */
export async function countByNameAndGrade(
  username: string,
  grade: number,
  executor: Executor = database,
) {
  const [row] = await executor
    .select({ count: count() })
    .from(user)
    .where(
      and(
        eq(user.username, username),
        eq(user.grade, grade),
        isNull(user.deleted_at),
      ),
    );
  return row?.count ?? 0;
}

/** Moves every member of grade `from` to grade `to`. */
export async function changeGradeOfAll(
  from: number,
  to: number,
  executor: Executor = database,
) {
  await executor
    .update(user)
    .set({ grade: to, updated_at: new Date() })
    .where(eq(user.grade, from));
}

export type ProfileFields = Partial<
  Pick<
    typeof user.$inferInsert,
    | 'username'
    | 'nickname'
    | 'aaa_no'
    | 'col_no'
    | 'major'
    | 'email'
    | 'mobile'
    | 'introduction'
    | 'grade'
    | 'profile_path'
    | 'profile_url'
  >
>;

/** Updates the given profile fields; fields left `undefined` stay. */
export async function updateProfile(
  userId: number,
  fields: ProfileFields,
  executor: Executor = database,
) {
  await executor
    .update(user)
    .set({ ...fields, updated_at: new Date() })
    .where(eq(user.user_id, userId));
}

/** The (not deleted) user's own info, with their contact details, or null. */
export async function findOwnInfo(
  userId: number,
  executor: Executor = database,
) {
  const [row] = await executor
    .select({
      user_id: user.user_id,
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      aaa_no: user.aaa_no,
      user_uuid: user.user_uuid,
      col_no: user.col_no,
      major: user.major,
      email: user.email,
      mobile: user.mobile,
      introduction: user.introduction,
      grade: user.grade,
      level: user.level,
      profile_path: user.profile_path,
      profile_url: user.profile_url,
      login_at: user.login_at,
    })
    .from(user)
    .where(and(eq(user.user_id, userId), isNull(user.deleted_at)));
  return row ?? null;
}

/**
 * The (not deleted) user's profile page, without their contact details, or
 * null.
 */
export async function findProfileByUuid(
  userUuid: string,
  executor: Executor = database,
) {
  if (!UUID.test(userUuid)) {
    return null;
  }
  const [row] = await executor
    .select({
      user_id: user.user_id,
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      aaa_no: user.aaa_no,
      col_no: user.col_no,
      major: user.major,
      introduction: user.introduction,
      grade: user.grade,
      level: user.level,
      profile_path: user.profile_path,
      profile_url: user.profile_url,
    })
    .from(user)
    .where(and(eq(user.user_uuid, userUuid), isNull(user.deleted_at)));
  return row ?? null;
}

/** The columns the member list can sort by. */
export const MEMBER_SORT_COLUMNS = {
  user_id: user.user_id,
  id: user.id,
  nickname: user.nickname,
  aaa_no: user.aaa_no,
  grade: user.grade,
  created_at: user.created_at,
  login_at: user.login_at,
};

export type MemberSort = keyof typeof MEMBER_SORT_COLUMNS;

/** A page of the (not deleted) members, for the staff's member list. */
export async function list(
  sort: { column: MemberSort; ascending: boolean },
  page: { limit: number; offset: number },
  executor: Executor = database,
) {
  const column = MEMBER_SORT_COLUMNS[sort.column];
  return executor
    .select({
      user_uuid: user.user_uuid,
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      aaa_no: user.aaa_no,
      grade: user.grade,
      level: user.level,
      login_at: user.login_at,
      created_at: user.created_at,
    })
    .from(user)
    .where(isNull(user.deleted_at))
    .orderBy(sort.ascending ? asc(column) : desc(column))
    .limit(page.limit)
    .offset(page.offset);
}

/** How many (not deleted) members there are. */
export async function countAll(executor: Executor = database) {
  const [row] = await executor
    .select({ count: count() })
    .from(user)
    .where(isNull(user.deleted_at));
  return row.count;
}

/** The first (not deleted) members whose name contains the text. */
export async function searchByName(
  text: string,
  limit: number,
  executor: Executor = database,
) {
  return executor
    .select({
      user_uuid: user.user_uuid,
      username: user.username,
      nickname: user.nickname,
      profile_path: user.profile_path,
    })
    .from(user)
    .where(and(like(user.username, `%${text}%`), isNull(user.deleted_at)))
    .orderBy(asc(user.user_id))
    .limit(limit);
}

/** The (not deleted) user's password hash, or null when they left. */
export async function findPasswordHash(
  userId: number,
  executor: Executor = database,
) {
  const [row] = await executor
    .select({ password: user.password })
    .from(user)
    .where(and(eq(user.user_id, userId), isNull(user.deleted_at)));
  return row ?? null;
}

/** Stores a new password hash. */
export async function updatePassword(
  userId: number,
  passwordHash: string,
  executor: Executor = database,
) {
  await executor
    .update(user)
    .set({ password: passwordHash, updated_at: new Date() })
    .where(eq(user.user_id, userId));
}

/** Marks the user as left, unless they already left. */
export async function softDelete(
  userId: number,
  executor: Executor = database,
) {
  await executor
    .update(user)
    .set({ deleted_at: new Date() })
    .where(and(eq(user.user_id, userId), isNull(user.deleted_at)));
}

/** The login ids of the (not deleted) members with the name and email. */
export async function listLoginIdsByNameAndEmail(
  name: string,
  email: string,
  executor: Executor = database,
) {
  const rows = await executor
    .select({ id: user.id })
    .from(user)
    .where(
      and(
        eq(user.username, name),
        eq(user.email, email),
        isNull(user.deleted_at),
      ),
    )
    .orderBy(asc(user.user_id));
  return rows.map((row) => row.id);
}

/**
 * The (not deleted) member with the login id, with the name and email a
 * password reminder checks, or null. Locks the row until the transaction
 * ends.
 */
export async function findByLoginIdForUpdate(
  loginId: string,
  executor: Executor,
) {
  const [row] = await executor
    .select({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
    })
    .from(user)
    .where(and(eq(user.id, loginId), isNull(user.deleted_at)))
    .limit(1)
    .for('update');
  return row ?? null;
}

/**
 * The (not deleted) member with the login id, with their password hash and
 * the fields the login answers, or null.
 */
export async function findForLogin(
  loginId: string,
  executor: Executor = database,
) {
  const [row] = await executor
    .select({
      user_id: user.user_id,
      user_uuid: user.user_uuid,
      id: user.id,
      password: user.password,
      username: user.username,
      nickname: user.nickname,
      grade: user.grade,
      level: user.level,
      email: user.email,
      profile_path: user.profile_path,
      login_at: user.login_at,
    })
    .from(user)
    .where(and(eq(user.id, loginId), isNull(user.deleted_at)))
    .orderBy(asc(user.user_id))
    .limit(1);
  return row ?? null;
}

/**
 * Records a login: sets `login_at` (leaving `updated_at`, since the profile
 * didn't change) and adds a `tb_stats_login` row.
 */
export async function recordLogin(
  userId: number,
  at: Date,
  executor: Executor = database,
) {
  await executor
    .update(user)
    .set({ login_at: at })
    .where(eq(user.user_id, userId));
  await executor.insert(statsLogin).values({ user_id: userId, login_at: at });
}

/** Whether a (not deleted) member has the login id. */
export async function isLoginIdTaken(
  loginId: string,
  executor: Executor = database,
) {
  const [row] = await executor
    .select({ user_id: user.user_id })
    .from(user)
    .where(and(eq(user.id, loginId), isNull(user.deleted_at)))
    .limit(1);
  return Boolean(row);
}

export type NewUser = Omit<
  typeof user.$inferInsert,
  'user_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'login_at'
>;

/** Creates a member. */
export async function create(fields: NewUser, executor: Executor = database) {
  const now = new Date();
  await executor
    .insert(user)
    .values({ ...fields, created_at: now, updated_at: now });
}
