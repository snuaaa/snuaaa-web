import path from 'path';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { getRequestListener } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { NotFoundError } from './errors';
import { accessLog } from './hono/accessLog';
import { honoApp } from './hono/app';
import { onError } from './hono/errors';

const devServerOrigins = [
  'https://dev.snuaaa.net',
  'https://develop.snuaaa-web.pages.dev',
  // epic/<name> 브랜치 프리뷰 (<name>.snuaaa-web.pages.dev)
  /^https:\/\/[a-z0-9-]+\.snuaaa-web\.pages\.dev$/,
  'http://localhost:3000',
];
const prodServerOrigins = ['https://www.snuaaa.net', 'https://our.snuaaa.net'];

const allowedOrigins =
  process.env.NODE_ENV == 'develop' ? devServerOrigins : prodServerOrigins;

/** The request's origin when it is allowed, so CORS echoes it back. */
function allowedOrigin(origin: string) {
  return allowedOrigins.some((allowed) =>
    typeof allowed === 'string' ? allowed === origin : allowed.test(origin),
  )
    ? origin
    : null;
}

/** Legacy local-disk files (`profile_path` and the like), under `/static`. */
const uploadFolder = path.relative(
  process.cwd(),
  path.join(__dirname, '..', 'upload'),
);

/** The headers helmet set by default, which the web has relied on. */
const securityHeaders = secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    baseUri: ["'self'"],
    fontSrc: ["'self'", 'https:', 'data:'],
    formAction: ["'self'"],
    frameAncestors: ["'self'"],
    imgSrc: ["'self'", 'data:'],
    objectSrc: ["'none'"],
    scriptSrc: ["'self'"],
    scriptSrcAttr: ["'none'"],
    styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
    upgradeInsecureRequests: [],
  },
  // The web is served from another origin and loads `/static` images.
  crossOriginResourcePolicy: 'cross-origin',
  crossOriginOpenerPolicy: 'same-origin',
  originAgentCluster: '?1',
  referrerPolicy: 'no-referrer',
  strictTransportSecurity: 'max-age=31536000; includeSubDomains',
  xContentTypeOptions: 'nosniff',
  xDnsPrefetchControl: 'off',
  xDownloadOptions: 'noopen',
  xFrameOptions: 'SAMEORIGIN',
  xPermittedCrossDomainPolicies: 'none',
  xXssProtection: '0',
});

/**
 * The whole server: security headers, the access log, CORS, the legacy
 * `/static` files, and the API (`hono/app.ts`).
 */
export const server = new Hono({ strict: false });

server.use(securityHeaders);
// Tests make many requests; keep their access logs out of `log/`.
if (process.env.NODE_ENV !== 'test') {
  server.use(accessLog);
}
server.use(cors({ origin: allowedOrigin }));
server.use(
  '/static/*',
  serveStatic({
    root: uploadFolder,
    rewriteRequestPath: (requestPath) => requestPath.replace(/^\/static/, ''),
  }),
);
server.route('/', honoApp);
server.notFound(() => {
  throw new NotFoundError();
});
server.onError(onError);

/** The server as a Node request listener, for `http.createServer` and tests. */
const app = getRequestListener(server.fetch);

export default app;
