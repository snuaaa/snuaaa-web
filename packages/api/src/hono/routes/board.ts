import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { requireAuth, type AuthEnvironment } from '../auth';
import { validationHook } from '../errors';
import { z } from 'zod';
import { createDocument } from '../../services/document.service';
import { createExhibition } from '../../services/exhibition.service';
import { createPost } from '../../services/post.service';
import { createDocumentBody } from './document';
import { exhibitionFields, readFile } from './exhibition';
import { postBody } from './post';

const createExhibitionForm = z.object({
  ...exhibitionFields,
  poster: z.instanceof(File, { message: 'POSTER IS NOT ATTACHED' }),
});

/**
 * The endpoints under `/api/board/...` that moved to Hono: creating a post,
 * a document or an exhibition on a board. The rest of `/api/board` is still
 * on Express.
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
  )
  .post(
    '/:board_id/exhibition',
    zValidator('form', createExhibitionForm, validationHook),
    async (context) => {
      const { poster, ...input } = context.req.valid('form');
      await createExhibition(
        context.get('actor'),
        context.req.param('board_id'),
        input,
        await readFile(poster),
      );
      return context.json({ success: true });
    },
  );
