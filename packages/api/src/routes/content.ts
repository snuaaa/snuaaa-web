import express from 'express';
import path from 'path';
import multer from 'multer';

import {
  AuthenticatedRequest,
  verifyTokenMiddleware,
} from '../middlewares/auth';
import { AuthenticatedRequestWithFile } from '../middlewares/upload';
import { uploadFileToS3 } from '../utils/upload';

import {
  checkLike,
  likeContent,
  dislikeContent,
} from '../controllers/contentLike.controller';
import {
  retrieveComments,
  createComment,
} from '../controllers/comment.controller';
import {
  retrieveAttachedFile,
  increaseDownloadCount,
  createAttachedFile,
} from '../controllers/attachedFile.controller';

const router = express.Router();
const memoryUpload = multer({ storage: multer.memoryStorage() });

router.get(
  '/:content_id/comments',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { decodedToken } = req;

    try {
      const comments = await retrieveComments(
        req.params.content_id,
        decodedToken._id,
      );
      res.json(comments);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'INTERNAL SERVER ERROR',
      });
    }
  },
);

router.get('/:content_id/file/:file_id', async (req, res) => {
  try {
    const file = await retrieveAttachedFile(req.params.file_id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'FILE NOT FOUND',
      });
    }
    increaseDownloadCount(req.params.file_id);

    const filePath = file.get('file_path') as string;
    if (/^https?:\/\//i.test(filePath)) {
      return res.redirect(filePath);
    }
    res.download(filePath, file.get('original_name') as string);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'INTERNAL SERVER ERROR',
    });
  }
});

router.post(
  '/:content_id/file',
  verifyTokenMiddleware,
  memoryUpload.single('attachedFile'),
  async (req: AuthenticatedRequestWithFile, res) => {
    const { file } = req;

    try {
      if (!file) {
        return res.status(409).json({
          error: 'FILE IS NOT ATTACHED',
          code: 1,
        });
      }

      let file_type = '';
      const extention = path.extname(file.originalname).substr(1);
      if (['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG'].includes(extention)) {
        file_type = 'IMG';
      } else if (['doc', 'DOC', 'docx', 'DOCX'].includes(extention)) {
        file_type = 'DOC';
      } else if (['xls', 'XLS', 'xlsx', 'XLSX'].includes(extention)) {
        file_type = 'XLS';
      } else if (['ppt', 'PPT', 'pptx', 'PPTX'].includes(extention)) {
        file_type = 'PPT';
      } else if (['pdf', 'PPT'].includes(extention)) {
        file_type = 'PDF';
      } else if (['hwp', 'HWP'].includes(extention)) {
        file_type = 'HWP';
      } else if (['zip', 'ZIP'].includes(extention)) {
        file_type = 'ZIP';
      } else {
        file_type = 'N';
        console.error(extention);
      }

      const fileUrl = await uploadFileToS3(
        file.buffer,
        file.originalname,
        file.mimetype,
      );

      const data = {
        original_name: file.originalname,
        file_path: fileUrl,
        file_url: fileUrl,
        file_type: file_type,
      };
      await createAttachedFile(req.params.content_id, data);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        error: 'INTERNAL SERVER ERROR',
        code: 0,
      });
    }
  },
);

router.post(
  '/:content_id/comment',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { decodedToken } = req;

    try {
      await createComment(decodedToken._id, req.params.content_id, req.body);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(403).json({
        success: false,
        message: err instanceof Error ? err.message : 'INTERNAL SERVER ERROR',
      });
    }
  },
);

router.post(
  '/:content_id/like',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { decodedToken } = req;
    const content_id = req.params.content_id;
    const user_id = decodedToken._id;

    try {
      const isLiked = await checkLike(content_id, user_id);
      if (isLiked) {
        await dislikeContent(content_id, user_id);
      } else {
        await likeContent(content_id, user_id);
      }
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(403).json({
        success: false,
      });
    }
  },
);

export default router;
