import { describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { verifyTokenMiddleware } from '../../src/middlewares/auth';
import { api } from '../helpers/request';

/**
 * Every endpoint that needs a token. Path params are dummy values: the token
 * check runs before anything reads them.
 *
 * When you add an endpoint, add it here or to PUBLIC_ENDPOINTS. When routes
 * move to another framework, keep this list: it is the contract.
 */
const PROTECTED_ENDPOINTS = [
  'GET /api/auth/check',
  'GET /api/userinfo',
  'PATCH /api/userinfo',
  'PATCH /api/userinfo/password',
  'DELETE /api/userinfo',
  'GET /api/userinfo/all',
  'GET /api/userinfo/:user_uuid',
  'GET /api/userinfo/search/mini',
  'PATCH /api/user',
  'PATCH /api/user/:user_uuid/grade',
  'POST /api/user/migrate',
  'GET /api/board',
  'GET /api/board/:board_id',
  'GET /api/board/:board_id/posts',
  'GET /api/board/:board_id/tags',
  'POST /api/board/:board_id/post',
  'POST /api/board/:board_id/document',
  'GET /api/board/:board_id/exhibitions',
  'POST /api/board/:board_id/exhibition',
  'GET /api/photoboard/:board_id/albums',
  'POST /api/photoboard/:board_id/album',
  'GET /api/post/list',
  'GET /api/post/:post_id',
  'PATCH /api/post/:post_id',
  'DELETE /api/post/:post_id',
  'GET /api/album/:album_id',
  'PATCH /api/album/:album_id',
  'PATCH /api/album/:album_id/thumbnail',
  'DELETE /api/album/:album_id',
  'GET /api/album/:album_id/photos',
  'GET /api/photo/list',
  'GET /api/photo/:photo_id',
  'POST /api/photo',
  'PATCH /api/photo/:photo_id',
  'DELETE /api/photo/:photo_id',
  'POST /api/photo/migrate',
  'GET /api/document',
  'GET /api/document/:doc_id',
  'PATCH /api/document/:doc_id',
  'DELETE /api/document/:doc_id',
  'GET /api/home/soundbox',
  'GET /api/home/posts',
  'GET /api/home/posts/all',
  'GET /api/home/memory',
  'GET /api/home/astrophoto',
  'GET /api/home/comments',
  'GET /api/home/comments/all',
  'GET /api/home/riseset',
  'GET /api/content/:content_id/comments',
  'POST /api/content/:content_id/file',
  'POST /api/content/:content_id/comment',
  'POST /api/content/:content_id/like',
  'GET /api/comment/list',
  'PATCH /api/comment/:comment_id',
  'DELETE /api/comment/:comment_id',
  'POST /api/comment/:comment_id/like',
  'POST /api/image',
  'GET /api/exhibition/:exhibition_id',
  'PATCH /api/exhibition/:exhibition_id',
  'DELETE /api/exhibition/:exhibition_id',
  'GET /api/exhibition/:exhibition_id/exhibitPhotos',
  'POST /api/exhibition/:exhibition_id/exhibitPhoto',
  'POST /api/exhibition/migrate',
  'GET /api/exhibitPhoto/:exhibitPhoto_id',
  'PATCH /api/exhibitPhoto/:exhibitPhoto_id',
  'DELETE /api/exhibitPhoto/:exhibitPhoto_id',
  'POST /api/exhibitPhoto/migrate',
  'DELETE /api/file/:file_id',
  'POST /api/file/migrate',
  'GET /api/equipment',
  'GET /api/equipment/category',
  'GET /api/equipment/search',
  'POST /api/equipment',
  'PATCH /api/equipment',
  'DELETE /api/equipment/:id',
  'POST /api/equipment/category',
  'PATCH /api/equipment/category',
  'DELETE /api/equipment/category/:categoryId',
  'POST /api/equipment/rent',
  'POST /api/equipment/rent/:rentId/return',
  'GET /api/equipment/rent/me',
  'GET /api/equipment/rent/records',
  'PATCH /api/equipment/rent/:rentId/penalty',
  'GET /api/equipment/:id/rents',
  'POST /api/upload/image',
];

/** Endpoints that are public on purpose. */
const PUBLIC_ENDPOINTS = [
  'POST /api/auth/login',
  'GET /api/auth/login/guest',
  'POST /api/auth/signup',
  'POST /api/auth/signup/dupcheck',
  'POST /api/userinfo/find/id',
  'POST /api/userinfo/find/pw',
  // Photos of a public photo board are shown before login.
  'GET /api/photoboard/:board_id/photos',
  // File downloads are plain links, so they can't send the header.
  'GET /api/content/:content_id/file/:file_id',
];

function toRequest(endpoint: string) {
  const [method, path] = endpoint.split(' ');
  return {
    method: method.toLowerCase() as 'get' | 'post' | 'patch' | 'delete',
    // Numeric ids work for every param, including uuids (never reached).
    url: path.replace(/:\w+/g, '1'),
  };
}

describe.each(PROTECTED_ENDPOINTS)('%s', (endpoint) => {
  const { method, url } = toRequest(endpoint);

  it('rejects a request without a token', async () => {
    const res = await api()[method](url);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      error: 'UNAUTHENTICATED',
      message: 'Authorization does not exist.',
    });
  });

  it('rejects an expired token', async () => {
    const expired = jwt.sign(
      { _id: 1, grade: 1, level: 0, autoLogin: false },
      process.env.JWT_SECRET,
      { expiresIn: -10 },
    );

    const authorization = `Bearer ${expired}`;
    const res = await api()[method](url).set('Authorization', authorization);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      error: 'UNAUTHENTICATED',
      message: 'Token is not valid.',
    });
  });
});

/**
 * Keeps the lists above in sync with the Express routes, so a new endpoint
 * can't skip this test. It reads Express internals, so it only sees routes
 * still served by Express: drop it once every router has moved.
 */
it('lists every Express endpoint above', () => {
  type Layer = {
    route?: {
      path: string;
      methods: Record<string, boolean>;
      stack: { handle: unknown }[];
    };
    handle?: { stack?: Layer[] };
    regexp: RegExp;
  };
  const found = { protected: [] as string[], public: [] as string[] };

  const walk = (stack: Layer[], prefix: string) => {
    for (const layer of stack) {
      if (layer.route) {
        const path = (prefix + layer.route.path).replace(/\/$/, '');
        const isProtected = layer.route.stack.some(
          (s) => s.handle === verifyTokenMiddleware,
        );
        for (const method of Object.keys(layer.route.methods)) {
          const key = `${method.toUpperCase()} ${path}`;
          found[isProtected ? 'protected' : 'public'].push(key);
        }
      } else if (layer.handle?.stack) {
        const match = layer.regexp.source.match(/^\^\\\/(.*?)\\\/\?/);
        const mount = match ? '/' + match[1].replace(/\\\//g, '/') : '';
        walk(layer.handle.stack, prefix + mount);
      }
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walk((app as any)._router.stack, '');

  // A protected route missing from PROTECTED_ENDPOINTS, or a route without
  // the token check that isn't in PUBLIC_ENDPOINTS, shows up here.
  expect(
    found.protected.filter((e) => !PROTECTED_ENDPOINTS.includes(e)),
  ).toEqual([]);
  expect(found.public.filter((e) => !PUBLIC_ENDPOINTS.includes(e))).toEqual([]);
});
