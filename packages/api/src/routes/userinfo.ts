import express from 'express';
import bcrypt from 'bcryptjs';

import {
  verifyTokenMiddleware,
  AuthenticatedRequest,
} from '../middlewares/auth';
import { UserModel } from '../models';

import {
  deleteUser,
  retrieveUserPw,
  updateUserPw,
  retrieveUserById,
  retrieveUsersByEmailAndName,
} from '../controllers/user.controller';

import { sendMail } from '../utils/mail';

import 'dotenv/config';

const router = express.Router();

import cryptoRandomString from 'crypto-random-string';
import { BadRequestError, NotFoundError } from '../errors';

router.patch(
  '/password',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    const { decodedToken } = req;
    const user_id = decodedToken._id;
    const data = req.body;

    try {
      const userInfo: UserModel = await retrieveUserPw(user_id);

      if (!bcrypt.compareSync(data.password, userInfo.get('password'))) {
        return next(
          new BadRequestError('Current password is incorrect', { code: 1011 }),
        );
      }
      if (!data.newPassword) {
        return next(
          new BadRequestError('New password is required', { code: 1012 }),
        );
      }
      if (data.newPassword !== data.newPasswordCf) {
        return next(
          new BadRequestError('New password confirmation does not match', {
            code: 1013,
          }),
        );
      }
      if (data.newPassword.length < 8 || data.newPassword.length > 20) {
        return next(
          new BadRequestError('New password must be 8-20 characters', {
            code: 1014,
          }),
        );
      }

      await updateUserPw(user_id, bcrypt.hashSync(data.newPassword, 10));
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  '/',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    const { decodedToken } = req;

    try {
      await deleteUser(decodedToken._id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
);

router.post('/find/id', async (req, res, next) => {
  const data = req.body;

  try {
    const users = await retrieveUsersByEmailAndName(data.email, data.name);

    if (!users || users.length === 0) {
      return next(new NotFoundError());
    }

    let text = '회원님의 ID는 ';
    users.map((user, i) => {
      const id = user.getDataValue('id');
      if (i === 0) {
        text += id;
      } else {
        text += `, ${id}`;
      }
    });
    text += '입니다.';

    const mailOptions = {
      to: data.email,
      subject: '[SNUAAA] 회원님의 ID를 알려드립니다.',
      text: text,
    };

    await sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post('/find/pw', async (req, res, next) => {
  const data = req.body;

  try {
    const user: UserModel = await retrieveUserById(data.id);

    if (
      !user ||
      user.get('email') !== data.email ||
      user.get('username') !== data.name
    ) {
      return next(new NotFoundError());
    }

    const resetPw = cryptoRandomString({ length: 10 });
    await updateUserPw(user.get('user_id'), bcrypt.hashSync(resetPw, 10));

    const text = `임시비밀번호는 ${resetPw}입니다.\n
                로그인 하신 후 원하시는 비밀번호로 변경해주세요.`;
    const mailOptions = {
      to: data.email,
      subject: '[SNUAAA] 회원님의 임시 비밀번호를 알려드립니다.',
      text: text,
    };

    await sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
