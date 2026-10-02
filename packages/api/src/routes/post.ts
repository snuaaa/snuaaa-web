import express from 'express';

import {
  AuthenticatedRequest,
  verifyTokenMiddleware,
} from '../middlewares/auth';

import {
  updateContent,
  deleteContent,
  increaseViewNum,
} from '../controllers/content.controller';
import {
  PostFilter,
  retrievePost,
  retrievePostsWithFilter,
  SearchType,
} from '../controllers/post.controller';
import { checkLike } from '../controllers/contentLike.controller';
import { retrieveUserByUserUuid } from '../controllers/user.controller';
import { AuthorizationError, NotFoundError } from '../errors';

const router = express.Router();

router.get(
  '/list',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    const decodedToken = req.decodedToken;
    const userUuid = req.query.user_uuid as string;

    const filter: PostFilter = {
      board_id: req.query.board_id as string,
      read_grade: decodedToken.grade,
      limit: Number(req.query.limit) || undefined,
      offset: Number(req.query.offset) || undefined,
      search_keyword: (req.query.search_keyword as string) || undefined,
      search_type: (req.query.search_type as SearchType) || undefined,
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

      const postList = await retrievePostsWithFilter(filter);
      return res.json(postList);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/:post_id',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    const decodedToken = req.decodedToken;

    try {
      const postInfo = await retrievePost(req.params.post_id);

      if (postInfo.board.lv_read < decodedToken.grade) {
        return next(
          new AuthorizationError('Permission denied', { code: 4001 }),
        );
      }

      const [likeInfo] = await Promise.all([
        checkLike(req.params.post_id, decodedToken._id),
        increaseViewNum(req.params.post_id),
      ]);

      res.json({ postInfo, likeInfo });
    } catch (err) {
      next(err);
    }
  },
);

router.patch('/:post_id', verifyTokenMiddleware, async (req, res, next) => {
  try {
    await updateContent(req.params.post_id, req.body);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/:post_id', verifyTokenMiddleware, async (req, res, next) => {
  try {
    await deleteContent(req.params.post_id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
