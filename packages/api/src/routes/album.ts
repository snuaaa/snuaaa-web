import express from 'express';

import {
  AuthenticatedRequest,
  verifyTokenMiddleware,
} from '../middlewares/auth';

import { retrieveAlbum } from '../controllers/album.controller';
import { retrievePhotosInAlbum } from '../controllers/photo.controller';
import { retrieveTagsOnBoard } from '../controllers/tag.controller';
import { retrieveCategoryByBoard } from '../controllers/category.controller';
import { assertBoardAccess } from '../controllers/board.controller';

const router = express.Router();

router.get(
  '/:album_id',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    const decodedToken = req.decodedToken;

    try {
      const albumInfo = await retrieveAlbum(req.params.album_id);

      assertBoardAccess(albumInfo.board, decodedToken.grade, 'read');

      const [categoryInfo, tagInfo] = await Promise.all([
        retrieveCategoryByBoard(albumInfo.getDataValue('board_id')),
        retrieveTagsOnBoard(albumInfo.getDataValue('board_id')),
      ]);

      res.json({
        albumInfo,
        categoryInfo,
        tagInfo,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/:album_id/photos',
  verifyTokenMiddleware,
  async (req, res, next) => {
    try {
      const photos = await retrievePhotosInAlbum(req.params.album_id);
      res.json(photos);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
