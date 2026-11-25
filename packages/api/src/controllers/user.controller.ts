import { UserModel } from '../models';
import uuid4 from 'uuid4';
import { BadRequestError, ConflictError, NotFoundError } from '../errors';

export async function createUser(userData) {
  await UserModel.create({
    user_uuid: uuid4(),
    id: userData.id,
    password: userData.password,
    username: userData.username,
    nickname: userData.nickname,
    aaa_no: userData.aaa_no,
    col_no: userData.col_no,
    major: userData.major,
    email: userData.email,
    mobile: userData.mobile,
    introduction: userData.introduction,
    profile_path: userData.profile_path,
    profile_url: userData.profile_url,
    grade: userData.grade,
    level: userData.level,
  });
}

export async function retrieveUser(user_id) {
  if (!user_id) {
    throw new BadRequestError('user_id can not be null');
  }

  const user = await UserModel.findOne({
    attributes: [
      'user_id',
      'id',
      'username',
      'nickname',
      'aaa_no',
      'user_uuid',
      'col_no',
      'major',
      'email',
      'mobile',
      'introduction',
      'grade',
      'level',
      'profile_path',
      'profile_url',
      'login_at',
    ],
    where: { user_id: user_id },
  });

  if (!user) {
    throw new NotFoundError('id is not correct');
  }

  return user;
}

export async function retrieveUserById(id) {
  if (!id) {
    throw new BadRequestError('id can not be null');
  }

  const user = await UserModel.findOne({
    attributes: [
      'user_id',
      'user_uuid',
      'id',
      'password',
      'username',
      'nickname',
      'grade',
      'level',
      'email',
      'profile_path',
      'login_at',
    ],
    where: { id: id },
  });

  if (!user) {
    throw new NotFoundError('id is not correct');
  }

  return user;
}

export async function updateLoginDate(user_id) {
  if (!user_id) {
    throw new BadRequestError('id can not be null');
  }

  await UserModel.update(
    {
      login_at: new Date(),
    },
    {
      where: {
        user_id: user_id,
      },
      silent: true,
    },
  );
}

export async function checkDupId(id) {
  if (!id) {
    throw new BadRequestError('id can not be null');
  }

  const user = await UserModel.findOne({
    where: { id: id },
  });

  if (user) {
    throw new ConflictError('id is duplicated');
  }
}
