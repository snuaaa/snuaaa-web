import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth, type AuthEnvironment } from '../auth';
import { validationHook } from '../errors';
import {
  createPhotos,
  deletePhoto,
  listPhotos,
  retrievePhoto,
  updatePhoto,
} from '../../services/photo.service';
import { pageNumber, pageSize } from './query';

// The web sends '' for an empty field, and leaves out an empty date.
const shotFields = {
  location: z.string().max(256).nullish(),
  camera: z.string().max(256).nullish(),
  lens: z.string().max(256).nullish(),
  exposure_time: z.string().max(256).nullish(),
  focal_length: z.string().max(64).nullish(),
  f_stop: z.string().max(64).nullish(),
  iso: z.string().max(64).nullish(),
  date: z.preprocess(
    (value) => (value === '' ? null : value),
    z.coerce.date().nullish(),
  ),
};

const tagIds = z.array(z.string().max(16));

/** One photo of the list `PhotoUploader` sends, after uploading its image. */
const newPhoto = z.object({
  title: z.string().max(128).nullish(),
  text: z.string().nullish(),
  category_id: z.string().max(16).nullish(),
  img_url: z.string().min(1).max(256),
  thumbnail_url: z.string().min(1).max(256),
  ...shotFields,
  tags: tagIds,
});

const createBody = z.object({
  board_id: z.string(),
  album_id: z.union([z.number(), z.string()]).nullish(),
  list: z.array(newPhoto),
});

const updateBody = z.object({
  title: z.string().max(128).nullish(),
  text: z.string().nullish(),
  photo: z.object(shotFields),
  tags: tagIds,
});

// Like Express did, a limit or offset that isn't a positive number falls
// back to the default. `tags` is read separately: it is a list.
const listQuery = z.object({
  board_id: z.string().optional(),
  user_uuid: z.string().optional(),
  limit: pageSize(20),
  offset: pageNumber(0),
  search_type: z.string().optional(),
  search_keyword: z.string().optional(),
});

/** `/api/photo/...`. */
export const photoRoutes = new Hono<AuthEnvironment>()
  .use(requireAuth)
  .get(
    '/list',
    zValidator('query', listQuery, validationHook),
    async (context) => {
      const query = context.req.valid('query');
      // axios sends a list as `tags[]=a&tags[]=b`; one tag may come as `tags=a`.
      const tagIds = [
        ...(context.req.queries('tags[]') ?? []),
        ...(context.req.queries('tags') ?? []),
      ];
      return context.json(
        await listPhotos(context.get('actor'), {
          boardId: query.board_id || undefined,
          userUuid: query.user_uuid || undefined,
          tagIds: tagIds.length > 0 ? tagIds : undefined,
          limit: query.limit,
          offset: query.offset,
          searchType: query.search_type,
          searchKeyword: query.search_keyword,
        }),
      );
    },
  )
  .get('/:photo_id', async (context) => {
    return context.json(
      await retrievePhoto(context.get('actor'), context.req.param('photo_id'), {
        byAuthor: context.req.query('navigation') === 'user',
      }),
    );
  })
  .post(
    '/',
    zValidator('json', createBody, validationHook),
    async (context) => {
      const body = context.req.valid('json');
      const contentIds = await createPhotos(context.get('actor'), {
        boardId: body.board_id,
        albumId: body.album_id,
        list: body.list,
      });
      return context.json({ success: true, list: contentIds });
    },
  )
  .patch(
    '/:photo_id',
    zValidator('json', updateBody, validationHook),
    async (context) => {
      await updatePhoto(
        context.get('actor'),
        context.req.param('photo_id'),
        context.req.valid('json'),
      );
      return context.json({ success: true });
    },
  )
  .delete('/:photo_id', async (context) => {
    await deletePhoto(context.get('actor'), context.req.param('photo_id'));
    return context.json({ success: true });
  });
