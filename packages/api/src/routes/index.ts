import express from 'express';

import auth from './auth';
import user from './user';
import userinfo from './userinfo';
import image from './image';
import upload from './upload';
// import { verifyTokenMiddleware } from '../middlewares/auth';

const router = express.Router();

router.use('/auth', auth);

// TODO: file download 이슈로 인해 임시로 주석처리. 쿠키를 이용한 인증 방식으로 변경 후 주석 해제
// router.use(verifyTokenMiddleware);
router.use('/userinfo', userinfo);
router.use('/user', user);
router.use('/image', image);
router.use('/upload', upload);

export default router;
