import express from 'express';

import {
  AuthenticatedRequest,
  verifyTokenMiddleware,
} from '../middlewares/auth';

import {
  updateContent,
  deleteContent,
} from '../controllers/content.controller';
import {
  retrieveAlbum,
  updateAlbum,
  updateAlbumThumbnail,
} from '../controllers/album.controller';
import { retrievePhotosInAlbum } from '../controllers/photo.controller';
import { retrieveTagsOnBoard } from '../controllers/tag.controller';
import { retrieveCategoryByBoard } from '../controllers/category.controller';
import { AuthorizationError } from '../errors';

const router = express.Router();

router.get(
  '/:album_id',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    const decodedToken = req.decodedToken;

    try {
      const albumInfo = await retrieveAlbum(req.params.album_id);

      if (albumInfo.board.lv_read < decodedToken.grade) {
        return next(new AuthorizationError(undefined, { code: 4001 }));
      }

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

router.patch('/:album_id', verifyTokenMiddleware, async (req, res, next) => {
  try {
    const contentData = {
      title: req.body.title,
      text: req.body.text,
      category_id: req.body.category_id,
    };
    const albumData = req.body.album;

    await Promise.all([
      updateContent(req.params.album_id, contentData),
      updateAlbum(req.params.album_id, albumData),
    ]);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.patch(
  '/:album_id/thumbnail',
  verifyTokenMiddleware,
  async (req, res, next) => {
    try {
      const tn_photo_id = req.body.tn_photo_id;
      await updateAlbumThumbnail(req.params.album_id, tn_photo_id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
);

router.delete('/:album_id', verifyTokenMiddleware, async (req, res, next) => {
  try {
    await deleteContent(req.params.album_id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

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
