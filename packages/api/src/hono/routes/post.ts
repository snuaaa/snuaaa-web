import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth, type AuthEnvironment } from '../auth';
import { validationHook } from '../errors';
import {
  createPost,
  deletePost,
  updatePost,
} from '../../services/post.service';

const postBody = z.object({
  title: z.string().nullish(),
  text: z.string().nullish(),
  category_id: z.string().nullish(),
});

/** `/api/post/...`. Reading posts (`GET`) is still on Express. */
export const postRoutes = new Hono<AuthEnvironment>()
  .use(requireAuth)
  .patch(
    '/:post_id',
    zValidator('json', postBody, validationHook),
    async (context) => {
      await updatePost(
        context.get('actor'),
        context.req.param('post_id'),
        context.req.valid('json'),
      );
      return context.json({ success: true });
    },
  )
  .delete('/:post_id', async (context) => {
    await deletePost(context.get('actor'), context.req.param('post_id'));
    return context.json({ success: true });
  });

/** The post endpoints under `/api/board/...`. */
export const boardPostRoutes = new Hono<AuthEnvironment>()
  .use(requireAuth)
  .post(
    '/:board_id/post',
    zValidator('json', postBody, validationHook),
    async (context) => {
      const contentId = await createPost(
        context.get('actor'),
        context.req.param('board_id'),
        context.req.valid('json'),
      );
      return context.json({ content_id: contentId, success: true });
    },
  );
