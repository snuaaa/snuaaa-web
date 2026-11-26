import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { requireAuth, type AuthEnvironment } from '../auth';
import { validationHook } from '../errors';
import { z } from 'zod';
import {
  listReadableBoards,
  retrieveBoard,
} from '../../services/board.service';
import { createDocument } from '../../services/document.service';
import {
  createExhibition,
  listExhibitions,
} from '../../services/exhibition.service';
import { createPost } from '../../services/post.service';
import { createDocumentBody } from './document';
import { exhibitionFields, readFile } from './exhibition';
import { postBody } from './post';

const createExhibitionForm = z.object({
  ...exhibitionFields,
  poster: z.instanceof(File, { message: 'POSTER IS NOT ATTACHED' }),
});

/** `/api/board/...` */
export const boardRoutes = new Hono<AuthEnvironment>()
  .use(requireAuth)
  .get('/', async (context) =>
    context.json(await listReadableBoards(context.get('actor'))),
  )
  .get('/:board_id', async (context) =>
    context.json({
      boardInfo: await retrieveBoard(
        context.get('actor'),
        context.req.param('board_id'),
      ),
    }),
  )
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
  .get('/:board_id/exhibitions', async (context) =>
    context.json(
      await listExhibitions(
        context.get('actor'),
        context.req.param('board_id'),
      ),
    ),
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
