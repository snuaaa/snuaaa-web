import express from 'express';
import multer from 'multer';
import uuid4 from 'uuid4';
import { AuthenticatedRequestWithFile } from '../middlewares/upload';
import {
  AuthenticatedRequest,
  verifyTokenMiddleware,
} from '../middlewares/auth';

import {
  retrieveExhibition,
  migrateExhibitionPosters,
} from '../controllers/exhibition.controller';
import {
  createExhibitPhoto,
  retrieveExhibitPhotosInExhibition,
} from '../controllers/exhibitPhoto.controller';
import { resizeImageBuffer } from '../utils/resize';
import { uploadImageToS3 } from '../utils/upload';
import { retrieveUserByUserUuid } from '../controllers/user.controller';
import { deleteContent } from '../controllers/content.controller';

const router = express.Router();
const memoryUpload = multer({ storage: multer.memoryStorage() });

router.get('/:exhibition_id', verifyTokenMiddleware, async (req, res) => {
  try {
    const exhibitionInfo = await retrieveExhibition(req.params.exhibition_id);
    res.json({ exhibitionInfo });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'RETRIEVE EXHIBITION FAIL',
      code: 0,
    });
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.patch(
  '/:exhibition_id',
  verifyTokenMiddleware,
  (_req: AuthenticatedRequest, _res) => {},
);

router.delete('/:exhibition_id', verifyTokenMiddleware, async (req, res) => {
  try {
    await deleteContent(req.params.exhibition_id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'DELETE ALBUM FAIL',
      code: 1,
    });
  }
});

router.get(
  '/:exhibition_id/exhibitPhotos',
  verifyTokenMiddleware,
  async (req, res) => {
    try {
      const exhibitPhotosInfo = await retrieveExhibitPhotosInExhibition(
        req.params.exhibition_id,
      );
      res.json({ exhibitPhotosInfo });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: 'RETRIEVE EXHIBITION FAIL',
        code: 0,
      });
    }
  },
);

router.post(
  '/:exhibition_id/exhibitPhoto',
  verifyTokenMiddleware,
  memoryUpload.single('exhibitPhoto'),
  async (req: AuthenticatedRequestWithFile, res) => {
    const { file, decodedToken } = req;

    if (!file) {
      return res.status(409).json({
        error: 'EXHIBITPHOTO IS NOT ATTACHED',
        code: 1,
      });
    }

    try {
      const photoInfo = JSON.parse(req.body.photoInfo);

      const resizedOriginalBuffer = await resizeImageBuffer(file.buffer);
      const resizedThumbnailBuffer = await resizeImageBuffer(file.buffer, {
        shortSideSize: 360,
      });

      const [imgUrl, thumbnailUrl] = await Promise.all([
        uploadImageToS3(resizedOriginalBuffer),
        uploadImageToS3(resizedThumbnailBuffer),
      ]);

      let photographer = null;
      if (photoInfo.photographer.user_uuid) {
        photographer = await retrieveUserByUserUuid(
          photoInfo.photographer.user_uuid,
        );
      }

      const data = {
        content_uuid: uuid4(),
        author_id: decodedToken._id,
        board_id: req.body.board_id,
        category_id: req.body.category_id,
        title: photoInfo.title,
        text: photoInfo.text,
        type: 'EP',
        parent_id: req.params.exhibition_id,
        order: photoInfo.order,
        photographer_id: photographer ? photographer.get('user_id') : null,
        photographer_alt: photographer ? null : photoInfo.photographer_alt,
        file_path: imgUrl,
        thumbnail_path: thumbnailUrl,
        img_url: imgUrl,
        thumbnail_url: thumbnailUrl,
        location: photoInfo.location,
        camera: photoInfo.camera,
        lens: photoInfo.lens,
        exposure_time: photoInfo.exposure_time,
        focal_length: photoInfo.focal_length,
        f_stop: photoInfo.f_stop,
        iso: photoInfo.iso,
        date: photoInfo.date ? new Date(photoInfo.date) : null,
      };

      await createExhibitPhoto(data);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: 'INTERNAL SERVER ERROR',
        code: 0,
      });
    }
  },
);

router.post('/migrate', verifyTokenMiddleware, async (req, res) => {
  try {
    await migrateExhibitionPosters();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal server error', code: 0 });
  }
});

export default router;
