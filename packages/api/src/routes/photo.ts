import express from 'express';

import {
  AuthenticatedRequest,
  verifyTokenMiddleware,
} from '../middlewares/auth';

import {
  retrievePhoto,
  retrieveNextPhoto,
  retrievePrevPhoto,
  retrieveAdjacentPhotoByAuthor,
  retrievePrevAlbumPhoto,
  retrieveNextAlbumPhoto,
  migratePhotos,
  retrievePhotosWithFilter,
  PhotoFilter,
} from '../controllers/photo.controller';
import { checkLike } from '../controllers/contentLike.controller';
import { increaseViewNum } from '../controllers/content.controller';
import { retrieveTagsOnBoard } from '../controllers/tag.controller';
import { retrieveUserByUserUuid } from '../controllers/user.controller';
import { SearchType } from '../controllers/post.controller';
import { NotFoundError } from '../errors';
import { assertBoardAccess } from '../controllers/board.controller';

const router = express.Router();

router.get(
  '/list',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
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
          return next(new NotFoundError('User not found'));
        }
        const author_id = user.getDataValue('user_id');
        filter['author_id'] = author_id;
      }

      const photos = await retrievePhotosWithFilter(filter);
      return res.json(photos);
    } catch (err) {
      next(err);
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

      assertBoardAccess(photoInfo.board, decodedToken.grade, 'read');

      const isUserNavigation = req.query.navigation === 'user';
      const prevPhotoPromise = isUserNavigation
        ? retrieveAdjacentPhotoByAuthor(
            req.params.photo_id,
            photoInfo.author_id,
            decodedToken.grade,
            'prev',
          )
        : retrievePrevPhoto(req.params.photo_id, photoInfo.parent_id);
      const nextPhotoPromise = isUserNavigation
        ? retrieveAdjacentPhotoByAuthor(
            req.params.photo_id,
            photoInfo.author_id,
            decodedToken.grade,
            'next',
          )
        : retrieveNextPhoto(req.params.photo_id, photoInfo.parent_id);

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
        prevPhotoPromise,
        nextPhotoPromise,
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
      next(err);
    }
  },
);

router.post('/migrate', verifyTokenMiddleware, async (req, res, next) => {
  try {
    await migratePhotos();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
