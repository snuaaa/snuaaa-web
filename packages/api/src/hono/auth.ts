import { createMiddleware } from 'hono/factory';
import jwt from 'jsonwebtoken';
import * as Sentry from '@sentry/node';
import { AuthenticationError } from '../errors';
import type { JWTPayload } from '../utils/token';

export type AuthEnv = { Variables: { actor: JWTPayload } };

/**
 * The Hono counterpart of `verifyTokenMiddleware`: reads
 * `Authorization: Bearer <token>`, answers 401 with the same messages, and
 * sets `c.get('actor')` to the decoded token.
 */
export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const header = c.req.header('Authorization');
  if (!header) {
    throw new AuthenticationError('Authorization does not exist.');
  }

  const [type, token] = header.split(' ');
  if (type !== 'Bearer') {
    throw new AuthenticationError('Token Type Error.');
  }
  if (!token) {
    throw new AuthenticationError('Token does not exist.');
  }

  let decoded: JWTPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
  } catch {
    throw new AuthenticationError('Token is not valid.');
  }

  c.set('actor', decoded);
  Sentry.setUser({ id: decoded._id });
  await next();
});
