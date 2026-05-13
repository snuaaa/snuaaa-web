import express from 'express';

import { AuthenticatedRequest, verifyTokenMiddleware } from '../middlewares/auth';

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
} from '../controllers/photo.controller';
import { checkLike } from '../controllers/contentLike.controller';
import { updateContent, deleteContent, increaseViewNum } from '../controllers/content.controller';
import { retrieveTagsOnBoard } from '../controllers/tag.controller';
import { createContentTag, updateContentTag } from '../controllers/contentTag.controller';
import { retrieveUserByUserUuid } from '../controllers/user.controller';
import { SearchType } from '../controllers/post.controller';

const router = express.Router();

router.get('/list', verifyTokenMiddleware, async (req: AuthenticatedRequest, res) => {
  const decodedToken = req.decodedToken;
  const userUuid = req.query.user_uuid as string;
  const filter: Record<string, unknown> = {
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
});

router.get('/:photo_id', verifyTokenMiddleware, (req: AuthenticatedRequest, res, next) => {
  let photoInfo: Record<string, unknown> = {};
  const { decodedToken } = req;

  retrievePhoto(req.params.photo_id)
    .then((info) => {
      photoInfo = info;
      if (photoInfo.board.lv_read < decodedToken.grade) {
        const err = {
          status: 403,
          code: 4001,
        };
        next(err);
        return;
      } else {
        return Promise.all([
          checkLike(req.params.photo_id, decodedToken._id),
          retrieveTagsOnBoard(photoInfo.board_id),
          retrievePrevPhoto(req.params.photo_id, photoInfo.parent_id),
          retrieveNextPhoto(req.params.photo_id, photoInfo.parent_id),
          retrievePrevAlbumPhoto(photoInfo.parent_id, photoInfo.board_id),
          retrieveNextAlbumPhoto(photoInfo.parent_id, photoInfo.board_id),
          increaseViewNum(req.params.photo_id),
        ]);
      }
    })
    .then((infos) => {
      if (infos) {
        res.json({
          photoInfo: photoInfo,
          likeInfo: infos[0],
          boardTagInfo: infos[1],
          // albumPhotosInfo: infos[],
          prevPhoto: infos[2],
          nextPhoto: infos[3],
          prevAlbumPhoto: infos[4],
          nextAlbumPhoto: infos[5],
        });
      } else {
        res.status(404).json();
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        error: 'internal server error',
        code: 0,
      });
    });
});

router.post('/', verifyTokenMiddleware, async (req: AuthenticatedRequest, res) => {
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
        await Promise.all(tags.map((tag) => createContentTag(contentId, tag)));
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
});

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
    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'internal server error',
      code: 0,
    });
  }
});

router.delete('/:photo_id', verifyTokenMiddleware, (req, res) => {
  deletePhoto(req.params.photo_id)
    .then(() => {
      return deleteContent(req.params.photo_id);
    })
    .then(() => {
      return res.json({ success: true });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        error: 'internal server error',
        code: 0,
      });
    });
});

router.post('/migrate', (req, res) => {
  migratePhotos()
    .then(() => {
      res.json({ success: true });
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
