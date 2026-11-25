import express from 'express';
import {
  AuthenticatedRequest,
  verifyTokenMiddleware,
} from '../middlewares/auth';

import {
  retrieveExhibitPhoto,
  retrieveExhibitPhotosInExhibition,
} from '../controllers/exhibitPhoto.controller';
import { checkLike } from '../controllers/contentLike.controller';
import { increaseViewNum } from '../controllers/content.controller';

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

export default router;
