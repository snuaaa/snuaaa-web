import express from 'express';

import {
  AuthenticatedRequest,
  verifyTokenMiddleware,
} from '../middlewares/auth';

import {
  retrieveCommentsWithFilter,
  CommentFilter,
} from '../controllers/comment.controller';
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

// PATCH/DELETE /:comment_id and POST /:comment_id/like are served by Hono
// (`hono/routes/comment.ts`).

export default router;
