import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth, type AuthEnvironment } from '../auth';
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
export const commentRoutes = new Hono<AuthEnvironment>()
  .use(requireAuth)
  .patch(
    '/:comment_id',
    zValidator('json', commentBody, validationHook),
    async (context) => {
      await updateComment(
        context.get('actor'),
        context.req.param('comment_id'),
        context.req.valid('json'),
      );
      return context.json({ success: true });
    },
  )
  .delete('/:comment_id', async (context) => {
    await deleteComment(context.get('actor'), context.req.param('comment_id'));
    return context.json({ success: true });
  })
  .post('/:comment_id/like', async (context) => {
    await toggleCommentLike(
      context.get('actor'),
      context.req.param('comment_id'),
    );
    return context.json({ success: true });
  });

/** The comment and like endpoints under `/api/content/...`. */
export const contentCommentRoutes = new Hono<AuthEnvironment>()
  .use(requireAuth)
  .post(
    '/:content_id/comment',
    zValidator('json', commentBody, validationHook),
    async (context) => {
      await createComment(
        context.get('actor'),
        context.req.param('content_id'),
        context.req.valid('json'),
      );
      return context.json({ success: true });
    },
  )
  .post('/:content_id/like', async (context) => {
    await toggleContentLike(
      context.get('actor'),
      context.req.param('content_id'),
    );
    return context.json({ success: true });
  });
