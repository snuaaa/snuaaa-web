import { UserModel } from '../models';
import uuid4 from 'uuid4';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { resizeImageBuffer } from '../utils/resize';
import { uploadImageToS3 } from '../utils/upload';

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
    throw new Error('user_id can not be null');
  }

  const user = UserModel.findOne({
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
    throw new Error('id is not correct');
  }

  return user;
}

export async function retrieveUserPw(user_id) {
  if (!user_id) {
    throw new Error('user_id can not be null');
  }

  const user = await UserModel.findOne({
    attributes: ['password'],
    where: { user_id: user_id },
  });

  if (!user) {
    throw new Error('id is not correct');
  }

  return user;
}

export async function retrieveUserByUserUuid(user_uuid: string) {
  if (!user_uuid) {
    throw new Error('user_uuid can not be null');
  }

  return UserModel.findOne({
    attributes: [
      'user_id',
      'id',
      'username',
      'nickname',
      'aaa_no',
      'col_no',
      'major',
      'email',
      'mobile',
      'introduction',
      'grade',
      'level',
      'profile_path',
      'profile_url',
    ],
    where: { user_uuid: user_uuid },
  });
}

export async function retrieveUsers(sort, order, rowNum, offset) {
  return UserModel.findAndCountAll({
    attributes: [
      'user_uuid',
      'id',
      'username',
      'nickname',
      'aaa_no',
      'grade',
      'level',
      'login_at',
      'created_at',
    ],
    order: [[sort ? sort : 'user_id', order === 'ASC' ? 'ASC' : 'DESC']],
    limit: rowNum,
    offset: offset,
  });
}

export async function retrieveUsersByEmailAndName(email, username) {
  if (!email) {
    throw Error('email can not be null');
  }

  return UserModel.findAll({
    attributes: ['id'],
    where: { email: email, username: username },
  });
}

export async function retrieveUsersByName(username) {
  return UserModel.findAll({
    attributes: ['user_uuid', 'username', 'nickname', 'profile_path'],
    where: { username: { [Op.like]: `%${username}%` } },
    limit: 5,
  });
}

export async function retrieveUserById(id) {
  if (!id) {
    throw new Error('id can not be null');
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
    throw new Error('id is not correct');
  }

  return user;
}

export async function updateUser(user_id, data) {
  if (!user_id) {
    throw new Error('user_id can not be null');
  }

  await UserModel.update(
    {
      username: data.username,
      nickname: data.nickname,
      aaa_no: data.aaa_no,
      col_no: data.col_no,
      major: data.major,
      email: data.email,
      mobile: data.mobile,
      introduction: data.introduction,
      grade: data.grade,
      level: data.level,
      profile_path: data.profile_path,
      profile_url: data.profile_url,
    },
    {
      where: { user_id: user_id },
    },
  );
}

export async function updateUserPw(user_id, password) {
  if (!user_id) {
    throw new Error('user_id can not be null');
  }
  if (!password) {
    throw new Error('password can not be null');
  }

  await UserModel.update(
    {
      password: password,
    },
    {
      where: { user_id: user_id },
    },
  );
}

export async function deleteUser(user_id) {
  if (!user_id) {
    throw new Error('id can not be null');
  }

  await UserModel.destroy({
    where: {
      user_id: user_id,
    },
  });
}

export async function updateLoginDate(user_id) {
  if (!user_id) {
    throw new Error('id can not be null');
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
    throw new Error('id can not be null');
  }

  const user = await UserModel.findOne({
    where: { id: id },
  });

  if (user) {
    throw new Error('id is duplicated');
  }
}

export async function migrateUserProfilePhotos() {
  const users = await UserModel.findAll({
    where: {
      profile_path: {
        [Op.and]: [{ [Op.ne]: null }, { [Op.like]: '/profile/%' }],
      },
      profile_url: {
        [Op.is]: null,
      },
    },
    limit: 20,
    order: [['user_id', 'ASC']],
  });

  await Promise.all(
    users.map(async (user) => {
      const user_id = user.getDataValue('user_id');
      const filePath = path.join(
        '.',
        'upload',
        user.getDataValue('profile_path'),
      );

      let buffer: Buffer;
      try {
        buffer = await fs.promises.readFile(filePath);
      } catch (err) {
        console.error(`Local profile photo not found: ${filePath}`, err);
        await UserModel.update(
          {
            profile_url: '',
          },
          {
            where: { user_id: user_id },
            silent: true,
          },
        );
        return;
      }

      const resizedBuffer = await resizeImageBuffer(buffer, {
        shortSideSize: 300,
      });
      const s3Url = await uploadImageToS3(resizedBuffer, 'profile');

      await UserModel.update(
        {
          profile_url: s3Url,
          profile_path: s3Url,
        },
        {
          where: { user_id: user_id },
          silent: true,
        },
      );

      await fs.promises.unlink(filePath).catch((err) => {
        console.error(`Failed to delete local profile file: ${filePath}`, err);
      });
    }),
  );
}
