import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

import { AuthenticatedRequest, verifyTokenMiddleware } from '../middlewares/auth';

import { createContent } from '../controllers/content.controller';
import {
  createAlbum,
  retrieveAlbumsInBoard,
  retrieveAlbumCount,
} from '../controllers/album.controller';
import {
  createPhoto,
  retrievePhotoCountInBoard,
  retrievePhotosInBoard,
  retrievePhotoCountByTag,
  retrievePhotosByTag,
} from '../controllers/photo.controller';
import { createContentTag } from '../controllers/contentTag.controller';

import { resizeForThumbnail } from '../utils/resize';

const router = express.Router();

const storage = multer.diskStorage({
  // destination: './upload/album/',
  destination: function (req, file, cb) {
    if (!fs.existsSync('./upload/album/default')) {
      fs.mkdirSync('./upload/album/default');
    }
    cb(null, './upload/album/default/');
  },
  filename(req, file, cb) {
    const timestamp = new Date().valueOf();
    cb(null, timestamp + '_' + file.originalname);
  },
});

const upload = multer({ storage });

router.get('/:board_id/albums', verifyTokenMiddleware, (req: AuthenticatedRequest, res) => {
  let offset = 0;
  let albumCount = 0;
  const ROWNUM = 12;
  const { query } = req;

  if (Number(query.page) > 0) {
    offset = ROWNUM * (Number(query.page) - 1);
  }

  retrieveAlbumCount(req.params.board_id, req.query.category)
    .then((count: number) => {
      albumCount = count;
      return retrieveAlbumsInBoard(req.params.board_id, ROWNUM, offset, req.query.category);
    })
    .then((albumInfo) => {
      res.json({
        albumCount: albumCount,
        albumInfo: albumInfo,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(409).json({
        error: 'RETRIEVE ALBUM FAIL',
        code: 1,
      });
    });
});

router.get('/:board_id/photos', (req: AuthenticatedRequest, res) => {
  let offset = 0;
  let photoCount = 0;
  const tags = req.query.tags;
  const ROWNUM = 12;
  const { query } = req;

  if (Number(query.page) > 0) {
    offset = ROWNUM * (Number(query.page) - 1);
  }

  if (tags) {
    retrievePhotoCountByTag(tags)
      .then((count) => {
        photoCount = count as number;
        return retrievePhotosByTag(tags, ROWNUM, offset);
      })
      .then((photoInfo) => {
        res.json({
          photoCount: photoCount,
          photoInfo: photoInfo,
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(409).json({
          error: 'RETRIEVE ALBUM FAIL',
          code: 1,
        });
      });
  } else {
    retrievePhotoCountInBoard(req.params.board_id)
      .then((count) => {
        photoCount = count as number;
        return retrievePhotosInBoard(req.params.board_id, ROWNUM, offset);
      })
      .then((photoInfo) => {
        res.json({
          photoCount: photoCount,
          photoInfo: photoInfo,
        });
      })
      .catch(() => {
        res.status(409).json({
          error: 'RETRIEVE PHOTO FAIL',
          code: 1,
        });
      });
  }
});

router.post('/:board_id/album', verifyTokenMiddleware, (req: AuthenticatedRequest, res) => {
  const decodedToken = req.decodedToken;
  const user_id = decodedToken._id;
  createContent(user_id, req.params.board_id, req.body, 'AL')
    .then((content_id) => {
      return createAlbum(content_id, req.body);
    })
    .then(() => {
      res.json({ success: true });
    })
    .catch((err) => {
      console.error(err);
      res.status(403).json({
        success: false,
      });
    });
});

/**
 * @deprecated
 */
router.post(
  '/:board_id/photos',
  verifyTokenMiddleware,
  upload.single('uploadPhoto'),
  (req: AuthenticatedRequest, res) => {
    console.info(`[POST] ${req.baseUrl + req.url}`);

    const file = (req as AuthenticatedRequest & { file?: Express.Multer.File }).file;
    const decodedToken = req.decodedToken;

    try {
      if (!file) {
        res.status(409).json({
          error: 'PHOTO IS NOT ATTACHED',
          code: 1,
        });
      } else {
        const photoInfo = JSON.parse(req.body.photoInfo);
        const basename = path.basename(file.filename, path.extname(file.filename));
        resizeForThumbnail(file.path, null)
          .then(() => {
            const photoData = {
              ...photoInfo,
              type: 'PH',
              author_id: decodedToken._id,
              board_id: req.params.board_id,
              file_path: '/album/default/' + file.filename,
              thumbnail_path: `/album/default/${basename}_thumb.jpeg`,
            };
            return createPhoto(photoData);
          })
          .then((content_id) => {
            if (photoInfo.tags && photoInfo.tags.length > 0) {
              return Promise.all(
                photoInfo.tags.map((tag_id: string) => createContentTag(content_id, tag_id)),
              );
            }
          })
          .then(() => {
            res.json({ success: true });
          })
          .catch((err) => {
            console.log(err);
            res.status(409).json({
              error: 'CREATE PHOTO FAIL',
              code: 1,
            });
          });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: 'internal server error',
        code: 0,
      });
    }
  },
);

export default router;
