import type { RequestHandler } from 'express';
import type { Hono } from 'hono';
import { TrieRouter } from 'hono/router/trie-router';
import { getRequestListener } from '@hono/node-server';

/**
 * Express middleware that hands a request to the Hono app when one of its
 * routes matches the method and path, and passes everything else on to the
 * Express routers. This lets endpoints move to Hono one at a time (#158).
 *
 * Mount it before the body parsers, so Hono reads the raw request body.
 * Express middlewares mounted earlier (helmet, CORS, the access log) still
 * apply, because the headers they set are kept when Hono writes the
 * response.
 */
export function honoBridge(app: Hono): RequestHandler {
  // Middleware entries (`use`) are registered as ALL and would match every
  // path under their prefix, so only real routes decide ownership.
  const owned = new TrieRouter<true>();
  for (const route of app.routes) {
    if (route.method !== 'ALL') {
      owned.add(route.method, route.path, true);
    }
  }
  const listener = getRequestListener(app.fetch);

  return (request, response, next) => {
    // Express ignores a trailing slash, so `/api/comment/1/` must reach the
    // Hono route too (the Hono app is created with `strict: false`).
    const path =
      request.path.length > 1 ? request.path.replace(/\/+$/, '') : '/';
    const [matches] = owned.match(request.method, path);
    if (matches.length === 0) {
      return next();
    }
    listener(request, response).catch(next);
  };
}
