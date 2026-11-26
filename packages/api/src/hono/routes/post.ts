import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth, type AuthEnvironment } from '../auth';
import { validationHook } from '../errors';
import {
  deletePost,
  listPosts,
  retrievePost,
  updatePost,
} from '../../services/post.service';
import { pageNumber, pageSize } from './query';

/** The columns' sizes: `tb_content.title` and `category_id` are varchars. */
export const postBody = z.object({
  title: z.string().max(128).nullish(),
  text: z.string().nullish(),
  category_id: z.string().max(16).nullish(),
});

// Like Express did, a limit or offset that isn't a positive number falls
// back to the default.
const listQuery = z.object({
  board_id: z.string().optional(),
  user_uuid: z.string().optional(),
  limit: pageSize(20),
  offset: pageNumber(0),
  search_type: z.string().optional(),
  search_keyword: z.string().optional(),
});

/** `/api/post/...`. */
export const postRoutes = new Hono<AuthEnvironment>()
  .use(requireAuth)
  .get(
    '/list',
    zValidator('query', listQuery, validationHook),
    async (context) => {
      const query = context.req.valid('query');
      return context.json(
        await listPosts(context.get('actor'), {
          boardId: query.board_id || undefined,
          userUuid: query.user_uuid || undefined,
          limit: query.limit,
          offset: query.offset,
          searchType: query.search_type,
          searchKeyword: query.search_keyword,
        }),
      );
    },
  )
  .get('/:post_id', async (context) => {
    const { content, liked } = await retrievePost(
      context.get('actor'),
      context.req.param('post_id'),
    );
    return context.json({ postInfo: content, likeInfo: liked });
  })
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
