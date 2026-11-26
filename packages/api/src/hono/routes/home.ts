import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth, type AuthEnvironment } from '../auth';
import { validationHook } from '../errors';
import {
  listAllPosts,
  listRecentAstrophotos,
  listRecentMemories,
  listRecentPosts,
  retrieveRiseSet,
  retrieveSoundBox,
} from '../../services/home.service';
import { pageNumber } from './query';

const allPostsQuery = z.object({ page: pageNumber(1) });

/** `/api/home/...`: the home page reads. */
export const homeRoutes = new Hono<AuthEnvironment>()
  .use(requireAuth)
  .get('/soundbox', async (context) =>
    context.json(await retrieveSoundBox(context.get('actor'))),
  )
  .get('/posts', async (context) =>
    context.json(await listRecentPosts(context.get('actor'))),
  )
  .get(
    '/posts/all',
    zValidator('query', allPostsQuery, validationHook),
    async (context) =>
      context.json(
        await listAllPosts(
          context.get('actor'),
          context.req.valid('query').page,
        ),
      ),
  )
  .get('/memory', async (context) =>
    context.json(await listRecentMemories(context.get('actor'))),
  )
  .get('/astrophoto', async (context) =>
    context.json(await listRecentAstrophotos(context.get('actor'))),
  )
  .get('/riseset', (context) => context.json(retrieveRiseSet()));
