import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

import { verifyTokenMiddleware } from '../middlewares/auth';
import { AuthenticatedRequestWithFile } from '../middlewares/upload';

import { resizeAttatchedImg } from '../utils/resize';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const today = new Date();
    const year = today.getFullYear().toString();
    let month: string | number = today.getMonth() + 1;
    let day: string | number = today.getDate();
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    const dayformat = `${year}${month}${day}`;

    const imgDest = path.join('.', 'upload', 'attachedImage', dayformat);
    try {
      if (!fs.existsSync(path.join('.', 'upload', 'attachedImage'))) {
        fs.mkdirSync(path.join('.', 'upload', 'attachedImage'));
      }
      if (!fs.existsSync(imgDest)) {
        fs.mkdirSync(imgDest);
      }
    } catch (err) {
      console.error(err);
    }
    cb(null, imgDest);
  },
  filename(req, file, cb) {
    const timestamp = new Date().valueOf();
    cb(null, timestamp + '_' + file.originalname);
  },
});

const upload = multer({ storage });

router.post(
  '/',
  verifyTokenMiddleware,
  upload.single('attachedImage'),
  async (req: AuthenticatedRequestWithFile, res) => {
    const { file } = req;

    try {
      if (!file) {
        return res.status(409).json({
          error: 'PHOTO IS NOT ATTACHED',
          code: 1,
        });
      }

      await resizeAttatchedImg(file.path);

      let imgPath = '';
      path
        .relative('./upload/', file.path)
        .split(path.sep)
        .forEach((route) => {
          imgPath += '/' + route;
        });

      res.json({
        imgPath: imgPath,
        result: 'success',
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: 'internal server error',
        code: 0,
      });
    }
  },
);

export default router;
