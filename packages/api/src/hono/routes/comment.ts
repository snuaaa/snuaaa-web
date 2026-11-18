import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth, type AuthEnv } from '../auth';
import { validationHook } from '../errors';
import {
  createComment,
  deleteComment,
  toggleCommentLike,
  updateComment,
} from '../../services/comment.service';
import { toggleContentLike } from '../../services/contentLike.service';

const commentBody = z.object({
  text: z.string().nullish(),
  parent_comment_id: z.coerce.number().int().positive().nullish(),
});

/** `/api/comment/...` */
export const commentRoutes = new Hono<AuthEnv>()
  .use(requireAuth)
  .patch(
    '/:comment_id',
    zValidator('json', commentBody, validationHook),
    async (c) => {
      await updateComment(
        c.get('actor'),
        c.req.param('comment_id'),
        c.req.valid('json'),
      );
      return c.json({ success: true });
    },
  )
  .delete('/:comment_id', async (c) => {
    await deleteComment(c.get('actor'), c.req.param('comment_id'));
    return c.json({ success: true });
  })
  .post('/:comment_id/like', async (c) => {
    await toggleCommentLike(c.get('actor'), c.req.param('comment_id'));
    return c.json({ success: true });
  });

/** The comment and like endpoints under `/api/content/...`. */
export const contentCommentRoutes = new Hono<AuthEnv>()
  .use(requireAuth)
  .post(
    '/:content_id/comment',
    zValidator('json', commentBody, validationHook),
    async (c) => {
      await createComment(
        c.get('actor'),
        c.req.param('content_id'),
        c.req.valid('json'),
      );
      return c.json({ success: true });
    },
  )
  .post('/:content_id/like', async (c) => {
    await toggleContentLike(c.get('actor'), c.req.param('content_id'));
    return c.json({ success: true });
  });
