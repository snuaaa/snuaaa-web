import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth, type AuthEnvironment } from '../auth';
import { validationHook } from '../errors';
import {
  deleteAlbum,
  listAlbumPhotos,
  retrieveAlbum,
  setAlbumThumbnail,
  updateAlbum,
} from '../../services/album.service';

/** The columns' sizes: `tb_content.title` and `category_id` are varchars. */
const albumFields = {
  title: z.string().max(128).nullish(),
  text: z.string().nullish(),
  category_id: z.string().max(16).nullish(),
};

export const createAlbumBody = z.object({
  ...albumFields,
  is_private: z.boolean().nullish(),
});

// The web sends back the whole album it read; only these fields change.
const updateBody = z.object({
  ...albumFields,
  album: z.object({ is_private: z.boolean().nullish() }),
});

const thumbnailBody = z.object({
  tn_photo_id: z.union([z.number(), z.string()]).nullish(),
});

/** `/api/album/...`. */
export const albumRoutes = new Hono<AuthEnvironment>()
  .use(requireAuth)
  .get('/:album_id', async (context) => {
    return context.json(
      await retrieveAlbum(context.get('actor'), context.req.param('album_id')),
    );
  })
  .get('/:album_id/photos', async (context) => {
    return context.json(
      await listAlbumPhotos(
        context.get('actor'),
        context.req.param('album_id'),
      ),
    );
  })
  .patch(
    '/:album_id',
    zValidator('json', updateBody, validationHook),
    async (context) => {
      await updateAlbum(
        context.get('actor'),
        context.req.param('album_id'),
        context.req.valid('json'),
      );
      return context.json({ success: true });
    },
  )
  .patch(
    '/:album_id/thumbnail',
    zValidator('json', thumbnailBody, validationHook),
    async (context) => {
      await setAlbumThumbnail(
        context.get('actor'),
        context.req.param('album_id'),
        context.req.valid('json').tn_photo_id,
      );
      return context.json({ success: true });
    },
  )
  .delete('/:album_id', async (context) => {
    await deleteAlbum(context.get('actor'), context.req.param('album_id'));
    return context.json({ success: true });
  });
