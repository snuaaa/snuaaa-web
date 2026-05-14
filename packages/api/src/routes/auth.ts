import express from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';

import {
  verifyTokenMiddleware,
  AuthenticatedRequest,
} from '../middlewares/auth';
import {
  retrieveUser,
  retrieveUserById,
  updateLoginDate,
} from '../controllers/user.controller';
import { createStatsLogin } from '../controllers/statsLogin.controller';
import { createUser, checkDupId } from '../controllers/user.controller';
import { resize } from '../utils/resize';

import { createToken } from '../utils/token';
import { AuthenticatedRequestWithFile } from '../middlewares/upload';

const router = express.Router();

const storage = multer.diskStorage({
  destination: './upload/profile',
  filename(req, file, cb) {
    const timestamp = new Date().valueOf();
    cb(null, timestamp + '_' + file.originalname);
  },
});

const upload = multer({ storage });

async function updateLoginHistory(userId: number) {
  await Promise.all([createStatsLogin(userId), updateLoginDate(userId)]);
}

router.get(
  '/check',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const decodedToken = req.decodedToken;
      const userInfo = await retrieveUser(decodedToken._id);

      const loginAt = userInfo.get('login_at') as string;
      const userId = userInfo.get('user_id') as number;

      if (loginAt) {
        const recentLogin = new Date(loginAt).getTime();
        const current = new Date().getTime();
        // Update login history only after later than 1hours from last history.
        if (current - recentLogin > 60 * 60 * 1000) {
          await updateLoginHistory(userId);
        }
      } else {
        await updateLoginHistory(userId);
      }

      const token = await createToken({
        _id: userId,
        grade: userInfo.get('grade') as number,
        level: userInfo.get('level') as number,
        autoLogin: decodedToken.autoLogin,
      });

      return res.status(200).json({
        success: true,
        userInfo,
        autoLogin: decodedToken.autoLogin,
        token,
      });
    } catch (err) {
      console.error(err);
      return res.status(403).json({
        success: false,
        message: 'Token is not valid.',
      });
    }
  },
);

router.post('/login', async (req, res) => {
  try {
    if (typeof req.body.password !== 'string') {
      return res.status(401).json({
        error: 'LOGIN FAILED',
        code: 1,
      });
    }

    const user = await retrieveUserById(req.body.id);
    if (!user) {
      throw new Error('id is not correct');
    }
    if (
      !bcrypt.compareSync(req.body.password, user.get('password') as string)
    ) {
      throw new Error('password is not correct');
    }

    const loginAt = user.get('login_at') as string;
    const userId = user.get('user_id') as number;

    if (loginAt) {
      const recentLogin = new Date(loginAt).getTime();
      const current = new Date().getTime();
      // Update login history only after later than 1hours from last history.
      if (current - recentLogin > 60 * 60 * 1000) {
        await updateLoginHistory(userId);
      }
    } else {
      await updateLoginHistory(userId);
    }

    const token = await createToken({
      _id: userId,
      grade: user.get('grade') as number,
      level: user.get('level') as number,
      autoLogin: req.body.autoLogin ? true : false,
    });

    const userInfo = user.toJSON();
    delete userInfo.password;

    return res
      .status(200)
      .cookie('token', token, {
        path: '/',
        // domain: 'localhost:3000'
        // httpOnly: true
      })
      .json({
        sucess: true,
        userInfo,
        autoLogin: req.body.autoLogin ? true : false,
        token: token,
      });
  } catch (err) {
    console.error(err);
    return res.status(403).json({
      sucess: false,
      message: 'Login Info is not valid.',
    });
  }
});

router.get('/login/guest', async (req, res) => {
  try {
    const token = await createToken({
      _id: -1,
      grade: 10,
      level: 0,
      autoLogin: false,
    });

    return res
      .status(200)
      .cookie('token', token, {
        path: '/',
      })
      .json({
        sucess: true,
        userInfo: {
          user_id: -1,
          grade: 10,
          level: 0,
          profile_path: null,
          nickname: 'guest',
        },
        autoLogin: false,
        token: token,
      });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'INTERNAL SERVER ERROR',
    });
  }
});

router.post(
  '/signup',
  upload.single('profile'),
  async (req: AuthenticatedRequestWithFile, res) => {
    try {
      const usernameRegex = /^[a-zA-Z0-9]+$/;

      if (!usernameRegex.test(req.body.id)) {
        return res.status(400).json({
          error: 'BAD USERNAME',
          code: 1,
        });
      }

      // CHECK PASS LENGTH
      if (
        req.body.password.length < 4 ||
        typeof req.body.password !== 'string'
      ) {
        return res.status(400).json({
          error: 'BAD PASSWORD',
          code: 2,
        });
      }

      if (req.body.password !== req.body.passwordCf) {
        return res.status(400).json({
          error: 'BAD PASSWORD CONFIRM ',
          code: 3,
        });
      }

      let nickname = '';

      if (req.body.aaaNum) {
        if (/^[0-9]{2}[Aa]{3}-[0-9]{1,3}$/.test(req.body.aaaNum)) {
          // 00AAA-000
          nickname = req.body.aaaNum.substr(0, 2) + req.body.username;
        } else if (/^[Aa]{3}[0-9]{2}-[0-9]{1,3}$/.test(req.body.aaaNum)) {
          // AAA00-000
          nickname = req.body.aaaNum.substr(3, 2) + req.body.username;
        } else {
          nickname = req.body.username;
          req.body.aaaNum = null;
        }
      } else {
        nickname = req.body.username;
        req.body.aaaNum = null;
      }

      const grade = req.body.aaaNum ? 8 : 9;
      let profilePath: string | undefined;
      if (req.file) {
        profilePath = '/profile/' + req.file.filename;
        resize(req.file.path);
      }

      const userData = {
        id: req.body.id,
        password: bcrypt.hashSync(req.body.password, 8),
        username: req.body.username,
        nickname: nickname,
        aaa_no: req.body.aaaNum,
        col_no: req.body.schoolNum,
        major: req.body.major,
        email: req.body.email,
        mobile: req.body.mobile,
        introduction: req.body.introduction,
        profile_path: profilePath,
        grade: grade,
        level: 0,
      };

      await createUser(userData);
      console.log('sign Up Success  ');
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: 'Internal Server ERROR',
        code: 9,
      });
    }
  },
);

router.post('/signup/dupcheck', async (req, res) => {
  try {
    await checkDupId(req.body.check_id);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(403).json({
      success: false,
    });
  }
});

export default router;
