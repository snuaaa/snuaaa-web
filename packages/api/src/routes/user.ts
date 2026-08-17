import express from 'express';
import {
  migrateUserProfilePhotos,
  retrieveUser,
  updateUser,
} from '../controllers/user.controller';
import {
  AuthenticatedRequest,
  verifyTokenMiddleware,
} from '../middlewares/auth';

const parseNickname = (
  aaa_no: string,
  username: string,
): {
  verified: boolean;
  nickname: string;
} => {
  if (!aaa_no) {
    return { verified: false, nickname: username };
  }

  if (/^[0-9]{2}[Aa]{3}-[0-9]{1,3}$/.test(aaa_no)) {
    // 00AAA-000
    return { verified: true, nickname: aaa_no.substr(0, 2) + username };
  } else if (/^[Aa]{3}[0-9]{2}-[0-9]{1,3}$/.test(aaa_no)) {
    // AAA00-000
    return { verified: true, nickname: aaa_no.substr(3, 2) + username };
  }

  return { verified: true, nickname: username };
};

const router = express.Router();

router.patch(
  '/',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { decodedToken } = req;
    const user_id = decodedToken._id;

    try {
      const userInfo = await retrieveUser(user_id);

      const { verified, nickname } = parseNickname(
        req.body.aaa_no,
        req.body.username,
      );
      const prevGrade = userInfo.get('grade') as number;
      const grade = prevGrade < 9 ? prevGrade : verified ? 8 : 9;

      const userData = {
        username: req.body.username,
        nickname: nickname,
        aaa_no: req.body.aaa_no,
        col_no: req.body.col_no,
        major: req.body.major,
        email: req.body.email,
        mobile: req.body.mobile,
        introduction: req.body.introduction,
        grade: grade,
        profile_url: req.body.profile_url,
      };

      await updateUser(user_id, userData);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: 'internal server error',
        code: 0,
      });
    }
  },
);

router.post('/migrate', verifyTokenMiddleware, async (req, res) => {
  try {
    await migrateUserProfilePhotos();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'internal server error',
      code: 0,
    });
  }
});

export default router;
