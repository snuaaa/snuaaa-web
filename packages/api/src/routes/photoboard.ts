import express from 'express';

import { AuthenticatedRequest, verifyTokenMiddleware } from '../middlewares/auth';

import { createContent } from '../controllers/content.controller';
import {
  createAlbum,
  retrieveAlbumsInBoard,
  retrieveAlbumCount,
} from '../controllers/album.controller';
import {
  retrievePhotoCountInBoard,
  retrievePhotosInBoard,
  retrievePhotoCountByTag,
  retrievePhotosByTag,
} from '../controllers/photo.controller';

const router = express.Router();

router.get('/:board_id/albums', verifyTokenMiddleware, async (req: AuthenticatedRequest, res) => {
  let offset = 0;
  const ROWNUM = 12;
  const { query } = req;

  if (Number(query.page) > 0) {
    offset = ROWNUM * (Number(query.page) - 1);
  }

  try {
    const albumCount = await retrieveAlbumCount(req.params.board_id, req.query.category);
    const albumInfo = await retrieveAlbumsInBoard(
      req.params.board_id,
      ROWNUM,
      offset,
      req.query.category,
    );
    res.json({ albumCount, albumInfo });
  } catch (err) {
    console.error(err);
    res.status(409).json({
      error: 'RETRIEVE ALBUM FAIL',
      code: 1,
    });
  }
});

router.get('/:board_id/photos', async (req: AuthenticatedRequest, res) => {
  let offset = 0;
  const ROWNUM = 12;
  const { query } = req;
  const tags = req.query.tags;

  if (Number(query.page) > 0) {
    offset = ROWNUM * (Number(query.page) - 1);
  }

  try {
    if (tags) {
      const photoCount = (await retrievePhotoCountByTag(tags)) as number;
      const photoInfo = await retrievePhotosByTag(tags, ROWNUM, offset);
      res.json({ photoCount, photoInfo });
    } else {
      const photoCount = (await retrievePhotoCountInBoard(req.params.board_id)) as number;
      const photoInfo = await retrievePhotosInBoard(req.params.board_id, ROWNUM, offset);
      res.json({ photoCount, photoInfo });
    }
  } catch (err) {
    console.error(err);
    res.status(409).json({
      error: 'RETRIEVE PHOTO FAIL',
      code: 1,
    });
  }
});

router.post('/:board_id/album', verifyTokenMiddleware, async (req: AuthenticatedRequest, res) => {
  const decodedToken = req.decodedToken;
  const user_id = decodedToken._id;

  try {
    const content_id = await createContent(user_id, req.params.board_id, req.body, 'AL');
    await createAlbum(content_id, req.body);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(403).json({ success: false });
  }
});

export default router;
