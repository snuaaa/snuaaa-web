import { and, eq, isNull } from 'drizzle-orm';
import { database, type Executor } from '../db/client';
import { user } from '../db/schema';

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

/** The (not deleted) user with the uuid, with their grade, or null. */
export async function findGradeByUuid(
  userUuid: string,
  executor: Executor = database,
) {
  if (!UUID.test(userUuid)) {
    return null;
  }
  const [row] = await executor
    .select({ user_id: user.user_id, grade: user.grade })
    .from(user)
    .where(and(eq(user.user_uuid, userUuid), isNull(user.deleted_at)));
  return row ?? null;
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
