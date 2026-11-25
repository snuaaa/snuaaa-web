import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { requireAuth, type AuthEnvironment } from '../auth';
import { validationHook } from '../errors';
import { createAlbum } from '../../services/album.service';
import { createAlbumBody } from './album';

/**
 * The endpoints under `/api/photoboard/...` that moved to Hono: creating an
 * album. Listing a board's albums and photos is still on Express.
 */
export const photoboardRoutes = new Hono<AuthEnvironment>()
  .use(requireAuth)
  .post(
    '/:board_id/album',
    zValidator('json', createAlbumBody, validationHook),
    async (context) => {
      await createAlbum(
        context.get('actor'),
        context.req.param('board_id'),
        context.req.valid('json'),
      );
      return context.json({ success: true });
    },
  );
