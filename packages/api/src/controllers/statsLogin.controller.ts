import { StatsLoginModel } from '../models';

export async function createStatsLogin(user_id) {
  if (!user_id) {
    throw new Error('user_id can not be null');
  }

  await StatsLoginModel.create({
    user_id: user_id,
    login_at: new Date(),
  });
}

export async function retrieveRecentLogin(user_id) {
  if (!user_id) {
    throw new Error('user_id can not be null');
  }

  await StatsLoginModel.max('login_at', {
    where: { user_id: user_id },
  });
}
