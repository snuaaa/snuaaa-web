import express from 'express';
import {
  AuthenticatedRequest,
  verifyTokenMiddleware,
} from '../middlewares/auth';

import {
  retrieveExhibitPhoto,
  updateExhibitPhoto,
  deleteExhibitPhoto,
  retrieveExhibitPhotosInExhibition,
  migrateExhibitPhotos,
} from '../controllers/exhibitPhoto.controller';
import { checkLike } from '../controllers/contentLike.controller';
import {
  increaseViewNum,
  updateContent,
  deleteContent,
} from '../controllers/content.controller';
import { retrieveUserByUserUuid } from '../controllers/user.controller';

const router = express.Router();

router.get(
  '/:exhibitPhoto_id',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    const { decodedToken } = req;

    try {
      const exhibitPhotoInfo = await retrieveExhibitPhoto(
        req.params.exhibitPhoto_id,
      );
      const [likeInfo, exhibitPhotosInfo] = await Promise.all([
        checkLike(req.params.exhibitPhoto_id, decodedToken._id),
        retrieveExhibitPhotosInExhibition(exhibitPhotoInfo.parent_id),
        increaseViewNum(req.params.exhibitPhoto_id),
      ]);

      res.json({
        exhibitPhotoInfo,
        likeInfo,
        exhibitPhotosInfo,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/:exhibitPhoto_id',
  verifyTokenMiddleware,
  async (req, res, next) => {
    try {
      let photographer = null;
      if (req.body.photographer) {
        photographer = await retrieveUserByUserUuid(
          req.body.photographer.user_uuid,
        );
      }

      const data = {
        title: req.body.title,
        text: req.body.text,
        order: req.body.order,
        photographer_id: photographer ? photographer.get('user_id') : null,
        photographer_alt: photographer ? null : req.body.photographer_alt,
        location: req.body.location,
        camera: req.body.camera,
        lens: req.body.lens,
        exposure_time: req.body.exposure_time,
        focal_length: req.body.focal_length,
        f_stop: req.body.f_stop,
        iso: req.body.iso,
        date: req.body.date ? new Date(req.body.date) : null,
      };

      await Promise.all([
        updateContent(req.params.exhibitPhoto_id, data),
        updateExhibitPhoto(req.params.exhibitPhoto_id, data),
      ]);

      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  '/:exhibitPhoto_id',
  verifyTokenMiddleware,
  async (req, res, next) => {
    try {
      await deleteExhibitPhoto(req.params.exhibitPhoto_id);
      await deleteContent(req.params.exhibitPhoto_id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
);

router.post('/migrate', verifyTokenMiddleware, async (req, res, next) => {
  try {
    await migrateExhibitPhotos();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
