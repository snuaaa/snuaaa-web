import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth, type AuthEnvironment } from '../auth';
import { validationHook } from '../errors';
import { BadRequestError } from '../../errors';
import {
  listMembers,
  retrieveMemberProfile,
  retrieveMyInfo,
  searchMembers,
} from '../../services/user.service';
import { pageNumber } from './query';

const memberListQuery = z.object({
  sort: z.string().optional(),
  order: z.string().optional(),
  limit: pageNumber(20),
  // Like `pageNumber`, but 0 is a valid offset.
  offset: z
    .string()
    .optional()
    .transform((value) => {
      const number = Math.floor(Number(value));
      return number > 0 ? Math.min(number, 2_147_483_647) : 0;
    }),
});

/**
 * The member reads under `/api/userinfo/...`. The password change, leaving
 * and the id and password reminders are still on Express.
 */
export const userinfoRoutes = new Hono<AuthEnvironment>()
  .use(requireAuth)
  .get('/', async (context) =>
    context.json({
      success: true,
      userInfo: await retrieveMyInfo(context.get('actor')),
    }),
  )
  .get(
    '/all',
    zValidator('query', memberListQuery, validationHook),
    async (context) =>
      context.json({
        success: true,
        ...(await listMembers(
          context.get('actor'),
          context.req.valid('query'),
        )),
      }),
  )
  .get('/search/mini', async (context) => {
    const name = context.req.query('name');
    if (!name) {
      throw new BadRequestError('name is required');
    }
    return context.json({ success: true, userList: await searchMembers(name) });
  })
  .get('/:user_uuid', async (context) =>
    context.json({
      success: true,
      userInfo: await retrieveMemberProfile(context.req.param('user_uuid')),
    }),
  );
