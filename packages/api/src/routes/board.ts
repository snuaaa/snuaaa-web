import express from 'express';
import { verifyTokenMiddleware } from '../middlewares/auth';
import {
  assertBoardAccess,
  assertBoardAccessById,
  retrieveBoard,
  retrieveBoardsCanAccess,
} from '../controllers/board.controller';
import { retrievePostsInBoard } from '../controllers/post.controller';
import { retrieveTagsOnBoard } from '../controllers/tag.controller';
import type { AuthenticatedRequest } from '../middlewares/auth';

const router = express.Router();

router.get(
  '/',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const decodedToken = req.decodedToken;
      const boardInfo = await retrieveBoardsCanAccess(decodedToken.grade);
      return res.json(boardInfo);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/:board_id',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    const decodedToken = req.decodedToken;

    try {
      const boardInfo = await retrieveBoard(req.params.board_id);
      assertBoardAccess(
        boardInfo.get({ plain: true }),
        decodedToken.grade,
        'read',
      );
      res.json({
        boardInfo: boardInfo,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/:board_id/posts',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    let offset = 0;
    const ROWNUM = 10;
    const query = req.query;
    if ('page' in query && typeof query.page === 'number' && query.page > 0) {
      offset = ROWNUM * (query.page - 1);
    }

    try {
      await assertBoardAccessById(
        req.params.board_id,
        req.decodedToken.grade,
        'read',
      );
      const postInfo = await retrievePostsInBoard(
        req.params.board_id,
        ROWNUM,
        offset,
      );
      res.json({
        postCount: postInfo.count,
        postInfo: postInfo.rows,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/:board_id/tags',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      await assertBoardAccessById(
        req.params.board_id,
        req.decodedToken.grade,
        'read',
      );
      const tags = await retrieveTagsOnBoard(req.params.board_id);
      res.json(tags);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
