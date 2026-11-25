import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { requireAuth, type AuthEnvironment } from '../auth';
import { validationHook } from '../errors';
import { z } from 'zod';
import { createAlbum, listAlbums } from '../../services/album.service';
import { createAlbumBody } from './album';
import { pageNumber } from './query';

const albumListQuery = z.object({
  page: pageNumber(1),
  category: z.string().optional(),
  search_type: z.string().optional(),
  search_keyword: z.string().optional(),
});

/** `/api/photoboard/...`: a photo board's albums. */
export const photoboardRoutes = new Hono<AuthEnvironment>()
  .use(requireAuth)
  .get(
    '/:board_id/albums',
    zValidator('query', albumListQuery, validationHook),
    async (context) => {
      const query = context.req.valid('query');
      return context.json(
        await listAlbums(context.get('actor'), context.req.param('board_id'), {
          page: query.page,
          categoryId: query.category || undefined,
          searchType: query.search_type,
          searchKeyword: query.search_keyword,
        }),
      );
    },
  )
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
