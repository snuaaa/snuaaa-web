import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth, type AuthEnvironment } from '../auth';
import { validationHook } from '../errors';
import {
  deleteExhibitPhoto,
  updateExhibitPhoto,
} from '../../services/exhibitPhoto.service';

/**
 * An exhibit photo's details, as `ExhibitPhotoInfo` on the web, with the
 * columns' sizes. The web leaves out an empty date, and sends the picked
 * member as `photographer` (only `user_uuid` is read).
 */
export const exhibitPhotoFields = {
  title: z.string().max(128).nullish(),
  text: z.string().nullish(),
  order: z.number().int().max(2_147_483_647).nullish(),
  photographer: z.object({ user_uuid: z.string().nullish() }).nullish(),
  photographer_alt: z.string().max(32).nullish(),
  location: z.string().max(256).nullish(),
  camera: z.string().max(256).nullish(),
  lens: z.string().max(256).nullish(),
  exposure_time: z.string().max(256).nullish(),
  focal_length: z.string().max(32).nullish(),
  f_stop: z.string().max(8).nullish(),
  iso: z.string().max(8).nullish(),
  date: z.preprocess(
    (value) => (value === '' ? null : value),
    z.coerce.date().nullish(),
  ),
};

/** `/api/exhibitPhoto/...`. Reading exhibit photos (`GET`) is still on Express. */
export const exhibitPhotoRoutes = new Hono<AuthEnvironment>()
  .use(requireAuth)
  .patch(
    '/:exhibitPhoto_id',
    zValidator('json', z.object(exhibitPhotoFields), validationHook),
    async (context) => {
      await updateExhibitPhoto(
        context.get('actor'),
        context.req.param('exhibitPhoto_id'),
        context.req.valid('json'),
      );
      return context.json({ success: true });
    },
  )
  .delete('/:exhibitPhoto_id', async (context) => {
    await deleteExhibitPhoto(
      context.get('actor'),
      context.req.param('exhibitPhoto_id'),
    );
    return context.json({ success: true });
  });
