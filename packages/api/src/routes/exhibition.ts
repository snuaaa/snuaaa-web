import express from 'express';
import { verifyTokenMiddleware } from '../middlewares/auth';

import { retrieveExhibition } from '../controllers/exhibition.controller';
import { retrieveExhibitPhotosInExhibition } from '../controllers/exhibitPhoto.controller';

const router = express.Router();

router.get('/:exhibition_id', verifyTokenMiddleware, async (req, res, next) => {
  try {
    const exhibitionInfo = await retrieveExhibition(req.params.exhibition_id);
    res.json({ exhibitionInfo });
  } catch (err) {
    next(err);
  }
});

router.get(
  '/:exhibition_id/exhibitPhotos',
  verifyTokenMiddleware,
  async (req, res, next) => {
    try {
      const exhibitPhotosInfo = await retrieveExhibitPhotosInExhibition(
        req.params.exhibition_id,
      );
      res.json({ exhibitPhotosInfo });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
