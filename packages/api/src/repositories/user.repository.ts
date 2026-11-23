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
