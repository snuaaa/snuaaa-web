import express from 'express';
import multer from 'multer';
import bcrypt from 'bcryptjs';

import {
  verifyTokenMiddleware,
  AuthenticatedRequest,
} from '../middlewares/auth';
import { UserModel } from '../models';

import {
  retrieveUser,
  updateUser,
  deleteUser,
  retrieveUserPw,
  updateUserPw,
  retrieveUsers,
  retrieveUserById,
  retrieveUsersByEmailAndName,
  retrieveUserByUserUuid,
  retrieveUsersByName,
} from '../controllers/user.controller';

import { resize } from '../utils/resize';
import { sendMail } from '../utils/mail';

import 'dotenv/config';

const router = express.Router();

const storage = multer.diskStorage({
  destination: './upload/profile',
  filename(req, file, cb) {
    const timestamp = new Date().valueOf();
    cb(null, timestamp + '_' + file.originalname);
    // cb(new Error("Failed to make file name"), `${(new Date()).valueOf()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

import cryptoRandomString from 'crypto-random-string';
import { AuthenticatedRequestWithFile } from '../middlewares/upload';
import { AuthorizationError, BadRequestError, NotFoundError } from '../errors';

router.get(
  '/',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    const { decodedToken } = req;

    try {
      const user = await retrieveUser(decodedToken._id);

      if (!user) {
        return next(new NotFoundError('user not found'));
      }

      return res.json({
        success: true,
        userInfo: user,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @deprecated Use PATCH /user instead
 */
router.patch(
  '/',
  verifyTokenMiddleware,
  upload.single('profileImg'),
  async (req: AuthenticatedRequestWithFile, res, next) => {
    const { decodedToken } = req;
    const user_id = decodedToken._id;

    try {
      const userInfo = await retrieveUser(user_id);

      const data = req.body;
      if (req.file) {
        data.profile_path = '/profile/' + req.file.filename;
        resize(req.file.path);
      } else {
        data.profile_path = userInfo.get('profile_path');
      }

      let nickname = '';

      if (req.body.aaa_no) {
        if (/^[0-9]{2}[Aa]{3}-[0-9]{1,3}$/.test(req.body.aaa_no)) {
          // 00AAA-000
          nickname = req.body.aaa_no.substr(0, 2) + req.body.username;
        } else if (/^[Aa]{3}[0-9]{2}-[0-9]{1,3}$/.test(req.body.aaa_no)) {
          // AAA00-000
          nickname = req.body.aaa_no.substr(3, 2) + req.body.username;
        } else {
          nickname = data.username;
          data.aaa_no = null;
        }
      } else {
        nickname = data.username;
        data.aaa_no = null;
      }

      const prevGrade = userInfo.get('grade') as number;
      const grade = (() => {
        if (prevGrade < 9) {
          return prevGrade;
        }
        if (data.aaa_no) {
          return 8;
        }
        return 9;
      })();

      const userData = {
        username: data.username,
        nickname: nickname,
        aaa_no: data.aaa_no,
        col_no: data.col_no,
        major: data.major,
        email: data.email,
        mobile: data.mobile,
        introduction: data.introduction,
        grade: grade,
        profile_path: data.profile_path,
      };

      await updateUser(user_id, userData);
      return res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
);

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

router.get(
  '/all',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    const ROWNUM = 20;
    const { decodedToken } = req;

    if (decodedToken.grade > 6) {
      return next(new AuthorizationError());
    }

    try {
      const { count, rows } = await retrieveUsers(
        req.query.sort,
        req.query.order,
        req.query.limit ? req.query.limit : ROWNUM,
        req.query.offset ? req.query.offset : 0,
      );
      return res.json({
        success: true,
        userInfo: rows,
        count,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get('/:user_uuid', verifyTokenMiddleware, async (req, res, next) => {
  try {
    const userInfo = await retrieveUserByUserUuid(req.params.user_uuid);
    return res.json({
      success: true,
      userInfo,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/search/mini', verifyTokenMiddleware, async (req, res, next) => {
  if (!req.query.name) {
    return next(new BadRequestError('name is required'));
  }

  try {
    const users = await retrieveUsersByName(req.query.name);
    res.json({
      success: true,
      userList: users,
    });
  } catch (err) {
    next(err);
  }
});

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
