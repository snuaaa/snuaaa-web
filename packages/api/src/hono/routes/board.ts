import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { requireAuth, type AuthEnvironment } from '../auth';
import { validationHook } from '../errors';
import { createDocument } from '../../services/document.service';
import { createPost } from '../../services/post.service';
import { createDocumentBody } from './document';
import { postBody } from './post';

/**
 * The endpoints under `/api/board/...` that moved to Hono: creating a post or
 * a document on a board. The rest of `/api/board` is still on Express.
 */
export const boardRoutes = new Hono<AuthEnvironment>()
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
  )
  .post(
    '/:board_id/document',
    zValidator('json', createDocumentBody, validationHook),
    async (context) => {
      const contentId = await createDocument(
        context.get('actor'),
        context.req.param('board_id'),
        context.req.valid('json'),
      );
      return context.json({ content_id: contentId, success: true });
    },
  );
