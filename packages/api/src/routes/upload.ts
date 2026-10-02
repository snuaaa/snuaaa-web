import express from 'express';
import multer from 'multer';

import { verifyTokenMiddleware } from '../middlewares/auth';
import { AuthenticatedRequestWithFile } from '../middlewares/upload';

import { resizeImageBuffer } from '../utils/resize';
import {
  S3_RESOURCE_TYPES,
  S3ResourceType,
  uploadImageToS3,
} from '../utils/upload';
import { BadRequestError } from '../errors';

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

router.post(
  '/image',
  verifyTokenMiddleware,
  upload.single('image'),
  async (req: AuthenticatedRequestWithFile, res, next) => {
    const { file } = req;

    try {
      if (!file) {
        return next(new BadRequestError('Image is not attached'));
      }

      const resourceType = req.query.type as S3ResourceType;
      if (!S3_RESOURCE_TYPES.includes(resourceType)) {
        return next(new BadRequestError('Invalid or missing resource type'));
      }

      const withThumbnail = req.query.thumbnail === 'true';

      const [imgUrl, thumbnailUrl] = await Promise.all([
        resizeImageBuffer(file.buffer).then((buffer) =>
          uploadImageToS3(buffer, resourceType),
        ),
        ...(withThumbnail
          ? [
              resizeImageBuffer(file.buffer, { shortSideSize: 360 }).then(
                (buffer) => uploadImageToS3(buffer, resourceType),
              ),
            ]
          : []),
      ]);

      res.json({
        imgUrl,
        thumbnailUrl,
        result: 'success',
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
