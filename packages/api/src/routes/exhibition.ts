import express from 'express';
import path from 'path';
import uuid4 from 'uuid4';
import uploadMiddleware, {
  AuthenticatedRequestWithFile,
} from '../middlewares/upload';
import {
  AuthenticatedRequest,
  verifyTokenMiddleware,
} from '../middlewares/auth';

import { retrieveExhibition } from '../controllers/exhibition.controller';
import {
  createExhibitPhoto,
  retrieveExhibitPhotosInExhibition,
} from '../controllers/exhibitPhoto.controller';
import { resizeForThumbnail } from '../utils/resize';
import { retrieveUserByUserUuid } from '../controllers/user.controller';
import { deleteContent } from '../controllers/content.controller';

const router = express.Router();

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
  uploadMiddleware('EH').single('exhibitPhoto'),
  async (req: AuthenticatedRequestWithFile, res) => {
    const { file, decodedToken } = req;

    if (!file) {
      return res.status(409).json({
        error: 'EXHIBITPHOTO IS NOT ATTACHED',
        code: 1,
      });
    }

    try {
      const basename = path.basename(
        file.filename,
        path.extname(file.filename),
      );
      const photoInfo = JSON.parse(req.body.photoInfo);

      await resizeForThumbnail(file.path, null);

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
        file_path: `/exhibition/${req.body.exhibition_no}/${file.filename}`,
        thumbnail_path: `/exhibition/${req.body.exhibition_no}/${basename}_thumb.jpeg`,
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

export default router;
