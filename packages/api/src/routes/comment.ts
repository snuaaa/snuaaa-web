import express from 'express';

import {
  AuthenticatedRequest,
  verifyTokenMiddleware,
} from '../middlewares/auth';

import {
  retrieveCommentsWithFilter,
  CommentFilter,
} from '../controllers/comment.controller';
import {
  deleteComment,
  toggleCommentLike,
  updateComment,
} from '../services/comment.service';
import { retrieveUserByUserUuid } from '../controllers/user.controller';
import { NotFoundError } from '../errors';

const router = express.Router();

router.get(
  '/list',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    const decodedToken = req.decodedToken;
    const userUuid = req.query.user_uuid as string;

    const filter: CommentFilter = {
      read_grade: decodedToken.grade,
      limit: Number(req.query.limit) || undefined,
      offset: Number(req.query.offset) || undefined,
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

      const commentList = await retrieveCommentsWithFilter(filter);
      return res.json(commentList);
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/:comment_id',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      await updateComment(req.decodedToken, req.params.comment_id, req.body);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  '/:comment_id',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      await deleteComment(req.decodedToken, req.params.comment_id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/:comment_id/like',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      await toggleCommentLike(req.decodedToken, req.params.comment_id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
