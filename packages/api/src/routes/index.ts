import express from 'express'

import auth from './auth';
import userinfo from './userinfo';
import board from './board';
import post from './post';
import photoboard from './photoboard';
import album from './album';
import photo from './photo';
import document from './document';
import home from './home';
import content from './content';
import comment from './comment';
import image from './image';
import exhibition from './exhibition';
import exhibitPhoto from './exhibitPhoto';
import file from './file';
import equipment from './equipment';
import upload from './upload';
// import { verifyTokenMiddleware } from '../middlewares/auth';

const router = express.Router();

router.use('/auth', auth);

// TODO: file download 이슈로 인해 임시로 주석처리. 쿠키를 이용한 인증 방식으로 변경 후 주석 해제
// router.use(verifyTokenMiddleware);
router.use('/userinfo', userinfo);
router.use('/board', board);
router.use('/photoboard', photoboard);
router.use('/post', post);
router.use('/album', album);
router.use('/photo', photo);
router.use('/document', document);
router.use('/home', home);
router.use('/content', content);
router.use('/comment', comment);
router.use('/image', image);
router.use('/exhibition', exhibition);
router.use('/exhibitPhoto', exhibitPhoto);
router.use('/file', file);
router.use('/equipment', equipment);
router.use('/upload', upload);

export default router;
