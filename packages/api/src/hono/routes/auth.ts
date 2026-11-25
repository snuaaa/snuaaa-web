import { Hono, type Context } from 'hono';
import { setCookie } from 'hono/cookie';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth, type AuthEnvironment } from '../auth';
import { validationHook } from '../errors';
import {
  assertLoginIdFree,
  checkSession,
  guestSession,
  logIn,
  signUp,
} from '../../services/auth.service';
import { readFile } from './exhibition';

/** Sets the token cookie the web reads, like Express's `res.cookie`. */
function setTokenCookie(context: Context, token: string) {
  setCookie(context, 'token', token, { path: '/' });
}

// The service checks the id and password, so a wrong one is a 401.
const loginBody = z.object({
  id: z.unknown().optional(),
  password: z.unknown().optional(),
  autoLogin: z.unknown().optional(),
});

const text = (maxLength?: number) =>
  (maxLength === undefined ? z.string() : z.string().max(maxLength)).optional();

// The service checks the id and the passwords, with the messages the web
// knows; the other fields must fit their columns.
const signUpFields = z.object({
  id: text(),
  password: text(),
  passwordCf: text(),
  username: text(16),
  aaaNum: text(16),
  schoolNum: text(8),
  major: text(32),
  email: text(64),
  mobile: text(16),
  introduction: text(),
});

const signUpForm = signUpFields.extend({
  profile: z.instanceof(File).optional(),
});

const duplicateCheckBody = z.object({ check_id: z.unknown().optional() });

/**
 * `/api/auth/...`: logging in (as a member or a guest), renewing the
 * session, and signing up. Only `/check` needs a token.
 */
export const authRoutes = new Hono<AuthEnvironment>()
  .get('/check', requireAuth, async (context) =>
    context.json({
      success: true,
      ...(await checkSession(context.get('actor'))),
    }),
  )
  .post(
    '/login',
    zValidator('json', loginBody, validationHook),
    async (context) => {
      const { id, password, autoLogin } = context.req.valid('json');
      const session = await logIn(id, password, Boolean(autoLogin));
      setTokenCookie(context, session.token);
      // The typo is the contract; the web does not read this field.
      return context.json({ sucess: true, ...session });
    },
  )
  .get('/login/guest', async (context) => {
    const session = await guestSession();
    setTokenCookie(context, session.token);
    return context.json({ sucess: true, ...session });
  })
  .post(
    '/signup',
    // The web sends a multipart form, the profile photo included. Like
    // Express, a JSON body works too; each validator sees `{}` for the
    // other content type.
    zValidator('json', signUpFields, validationHook),
    zValidator('form', signUpForm, validationHook),
    async (context) => {
      const { profile, ...form } = context.req.valid('form');
      await signUp(
        { ...context.req.valid('json'), ...form },
        profile ? await readFile(profile) : undefined,
      );
      return context.json({ success: true });
    },
  )
  .post(
    '/signup/dupcheck',
    zValidator('json', duplicateCheckBody, validationHook),
    async (context) => {
      await assertLoginIdFree(context.req.valid('json').check_id);
      return context.json({ success: true });
    },
  );
