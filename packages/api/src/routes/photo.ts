import express from 'express';

import {
  AuthenticatedRequest,
  verifyTokenMiddleware,
} from '../middlewares/auth';

import {
  retrievePhoto,
  updatePhoto,
  deletePhoto,
  retrieveNextPhoto,
  retrievePrevPhoto,
  retrievePrevAlbumPhoto,
  retrieveNextAlbumPhoto,
  createPhoto,
  migratePhotos,
  retrievePhotosWithFilter,
  PhotoFilter,
} from '../controllers/photo.controller';
import { checkLike } from '../controllers/contentLike.controller';
import {
  updateContent,
  deleteContent,
  increaseViewNum,
} from '../controllers/content.controller';
import { retrieveTagsOnBoard } from '../controllers/tag.controller';
import {
  createContentTag,
  updateContentTag,
} from '../controllers/contentTag.controller';
import { retrieveUserByUserUuid } from '../controllers/user.controller';
import { SearchType } from '../controllers/post.controller';

const router = express.Router();

router.get(
  '/list',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const decodedToken = req.decodedToken;
    const userUuid = req.query.user_uuid as string;
    const filter: PhotoFilter = {
      board_id: req.query.board_id as string,
      read_grade: decodedToken.grade,
      limit: Number(req.query.limit) || undefined,
      offset: Number(req.query.offset) || undefined,
      search_keyword: (req.query.search_keyword as string) || undefined,
      search_type: (req.query.search_type as SearchType) || undefined,
      tags: (req.query.tags as string[]) || undefined,
    };

    try {
      if (userUuid) {
        const user = await retrieveUserByUserUuid(userUuid);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found',
          });
        }
        const author_id = user.getDataValue('user_id');
        filter['author_id'] = author_id;
      }

      const photos = await retrievePhotosWithFilter(filter);
      return res.json(photos);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: 'INTERNAL SERVER ERROR',
      });
    }
  },
);

router.get(
  '/:photo_id',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    const { decodedToken } = req;

    try {
      const photoInfo = await retrievePhoto(req.params.photo_id);

      if (photoInfo.board.lv_read < decodedToken.grade) {
        return next({ status: 403, code: 4001 });
      }

      const [
        likeInfo,
        boardTagInfo,
        prevPhoto,
        nextPhoto,
        prevAlbumPhoto,
        nextAlbumPhoto,
      ] = await Promise.all([
        checkLike(req.params.photo_id, decodedToken._id),
        retrieveTagsOnBoard(photoInfo.board_id),
        retrievePrevPhoto(req.params.photo_id, photoInfo.parent_id),
        retrieveNextPhoto(req.params.photo_id, photoInfo.parent_id),
        retrievePrevAlbumPhoto(photoInfo.parent_id, photoInfo.board_id),
        retrieveNextAlbumPhoto(photoInfo.parent_id, photoInfo.board_id),
        increaseViewNum(req.params.photo_id),
      ]);

      res.json({
        photoInfo,
        likeInfo,
        boardTagInfo,
        prevPhoto,
        nextPhoto,
        prevAlbumPhoto,
        nextAlbumPhoto,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: 'internal server error',
        code: 0,
      });
    }
  },
);

router.post(
  '/',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const decodedToken = req.decodedToken;
    const list = req.body.list;
    const boardId = req.body.board_id;
    const albumId = req.body.album_id;

    try {
      const contentIdList = await Promise.all(
        list.map(async (photo: Record<string, unknown>) => {
          const contentId = await createPhoto({
            ...photo,
            author_id: decodedToken._id,
            board_id: boardId,
            album_id: albumId,
          });
          const tags = photo.tags as string[];
          await Promise.all(
            tags.map((tag) => createContentTag(contentId, tag)),
          );
          return contentId;
        }),
      );
      return res.json({
        success: true,
        list: contentIdList,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: 'internal server error',
        code: 0,
      });
    }
  },
);

router.patch('/:photo_id', verifyTokenMiddleware, async (req, res) => {
  try {
    const contentData = {
      title: req.body.title,
      text: req.body.text,
    };
    const photoData = req.body.photo;
    const tagData = req.body.tags;

    if (!req.params.photo_id || !contentData || !photoData || !tagData) {
      return res.status(400).json({
        error: 'bad request',
        code: 0,
      });
    }

    await Promise.all([
      updateContent(req.params.photo_id, contentData),
      updatePhoto(req.params.photo_id, photoData),
      updateContentTag(Number(req.params.photo_id), tagData),
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'internal server error',
      code: 0,
    });
  }
});

router.delete('/:photo_id', verifyTokenMiddleware, async (req, res) => {
  try {
    await deletePhoto(req.params.photo_id);
    await deleteContent(req.params.photo_id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'internal server error',
      code: 0,
    });
  }
});

router.post('/migrate', async (req, res) => {
  try {
    await migratePhotos();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'internal server error',
      code: 0,
    });
  }
});

export default router;
