import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth, type AuthEnvironment } from '../auth';
import { validationHook } from '../errors';
import { changeGrade, updateMyProfile } from '../../services/user.service';

/** A text column: missing stays, null clears, and a number is read as text. */
const column = (maxLength: number) =>
  z.preprocess(
    (value) => (typeof value === 'number' ? String(value) : value),
    z.string().max(maxLength).nullish(),
  );

const profileBody = z.object({
  username: column(16),
  aaa_no: column(16),
  col_no: column(8),
  major: column(32),
  email: column(64),
  mobile: column(16),
  introduction: z.string().nullish(),
  profile_path: column(256),
  profile_url: column(256),
});

// Anything that isn't a number fails the grade check in the service.
const gradeBody = z.object({ grade: z.unknown().optional() });

/** `/api/user/...`: a member's own profile and grade changes. */
export const userRoutes = new Hono<AuthEnvironment>()
  .use(requireAuth)
  .patch(
    '/',
    zValidator('json', profileBody, validationHook),
    async (context) => {
      await updateMyProfile(context.get('actor'), context.req.valid('json'));
      return context.json({ success: true });
    },
  )
  .patch(
    '/:user_uuid/grade',
    zValidator('json', gradeBody, validationHook),
    async (context) => {
      await changeGrade(
        context.get('actor'),
        context.req.param('user_uuid'),
        Number(context.req.valid('json').grade),
      );
      return context.json({ success: true });
    },
  );
