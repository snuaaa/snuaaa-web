import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth, type AuthEnvironment } from '../auth';
import { validationHook } from '../errors';
import { BadRequestError } from '../../errors';
import {
  changeMyPassword,
  leave,
  remindLoginIds,
  resetPassword,
} from '../../services/account.service';
import {
  listMembers,
  retrieveMemberProfile,
  retrieveMyInfo,
  searchMembers,
} from '../../services/user.service';
import { pageSize } from './query';

const memberListQuery = z.object({
  sort: z.string().optional(),
  order: z.string().optional(),
  limit: pageSize(20),
  // Like `pageNumber`, but 0 is a valid offset.
  offset: z
    .string()
    .optional()
    .transform((value) => {
      const number = Math.floor(Number(value));
      return number > 0 ? Math.min(number, 2_147_483_647) : 0;
    }),
});

// The services check each field, so the codes and messages stay the ones
// the web reads; the schemas only pick the fields.
const passwordChangeBody = z.object({
  password: z.unknown().optional(),
  newPassword: z.unknown().optional(),
  newPasswordCf: z.unknown().optional(),
});

const reminderBody = z.object({
  id: z.unknown().optional(),
  name: z.unknown().optional(),
  email: z.unknown().optional(),
});

/**
 * The id and password reminders on the login page, without a token. Mount
 * before `userinfoRoutes`, whose token check covers all of `/userinfo`.
 */
export const userinfoReminderRoutes = new Hono()
  .post(
    '/find/id',
    zValidator('json', reminderBody, validationHook),
    async (context) => {
      const { name, email } = context.req.valid('json');
      await remindLoginIds(name, email);
      return context.json({ success: true });
    },
  )
  .post(
    '/find/pw',
    zValidator('json', reminderBody, validationHook),
    async (context) => {
      const { id, name, email } = context.req.valid('json');
      await resetPassword(id, name, email);
      return context.json({ success: true });
    },
  );

/**
 * A member's own account and the member reads under `/api/userinfo/...`.
 */
export const userinfoRoutes = new Hono<AuthEnvironment>()
  .use(requireAuth)
  .patch(
    '/password',
    zValidator('json', passwordChangeBody, validationHook),
    async (context) => {
      await changeMyPassword(context.get('actor'), context.req.valid('json'));
      return context.json({ success: true });
    },
  )
  .delete('/', async (context) => {
    await leave(context.get('actor'));
    return context.json({ success: true });
  })
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
