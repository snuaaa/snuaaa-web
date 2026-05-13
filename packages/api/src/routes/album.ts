import express from 'express';

import { AuthenticatedRequest, verifyTokenMiddleware } from '../middlewares/auth';

import { updateContent, deleteContent } from '../controllers/content.controller';
import { retrieveAlbum, updateAlbum, updateAlbumThumbnail } from '../controllers/album.controller';
import { retrievePhotosInAlbum } from '../controllers/photo.controller';
import { retrieveTagsOnBoard } from '../controllers/tag.controller';
import { retrieveCategoryByBoard } from '../controllers/category.controller';

const router = express.Router();

router.get('/:album_id', verifyTokenMiddleware, (req: AuthenticatedRequest, res) => {
  const decodedToken = req.decodedToken;

  try {
    let albumInfo = {};
    retrieveAlbum(req.params.album_id)
      .then((info) => {
        if (info.board.lv_read < decodedToken.grade) {
          res.status(403).json({
            code: 4001,
          });
        } else {
          albumInfo = info;
          return Promise.all([
            retrieveCategoryByBoard(albumInfo.board_id),
            retrieveTagsOnBoard(albumInfo.board_id),
          ]);
        }
      })
      .then((infos) => {
        res.json({
          albumInfo: albumInfo,
          categoryInfo: infos[0],
          tagInfo: infos[1],
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({
          error: 'internal server error',
          code: 0,
        });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'internal server error',
      code: 0,
    });
  }
});

router.patch('/:album_id', verifyTokenMiddleware, (req, res) => {
  try {
    const contentData = {
      title: req.body.title,
      text: req.body.text,
      category_id: req.body.category_id,
    };
    const albumData = req.body.album;

    Promise.all([
      updateContent(req.params.album_id, contentData),
      updateAlbum(req.params.album_id, albumData),
    ])
      .then(() => {
        res.json({
          success: true,
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(409).json({
          error: 'UPDATE ALBUM FAIL',
          code: 1,
        });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'internal server error',
      code: 0,
    });
  }
});

router.patch('/:album_id/thumbnail', verifyTokenMiddleware, (req, res) => {
  const tn_photo_id = req.body.tn_photo_id;
  updateAlbumThumbnail(req.params.album_id, tn_photo_id)
    .then(() => {
      res.json({
        success: true,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(409).json({
        error: 'UPDATE ALBUM FAIL',
        code: 1,
      });
    });
});

router.delete('/:album_id', verifyTokenMiddleware, (req, res) => {
  deleteContent(req.params.album_id)
    .then(() => {
      return res.json({ success: true });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        error: 'DELETE ALBUM FAIL',
        code: 1,
      });
    });
});

router.get('/:album_id/photos', verifyTokenMiddleware, (req, res) => {
  retrievePhotosInAlbum(req.params.album_id)
    .then((photos) => {
      res.json(photos);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        error: 'internal server error',
        code: 0,
      });
    });
});

export default router;
