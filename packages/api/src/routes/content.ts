import express from 'express';

import {
  AuthenticatedRequest,
  verifyTokenMiddleware,
} from '../middlewares/auth';

import { retrieveComments } from '../controllers/comment.controller';

const router = express.Router();

router.get(
  '/:content_id/comments',
  verifyTokenMiddleware,
  async (req: AuthenticatedRequest, res, next) => {
    const { decodedToken } = req;

    try {
      const comments = await retrieveComments(
        req.params.content_id,
        decodedToken._id,
      );
      res.json(comments);
    } catch (err) {
      next(err);
    }
  },
);

// POST /:content_id/comment and /:content_id/like are served by Hono
// (`hono/routes/comment.ts`), and the attached files by
// `hono/routes/attachedFile.ts`.

export default router;
