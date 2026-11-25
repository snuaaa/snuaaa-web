import { describe, expect, it } from 'vitest';
import { api } from '../helpers/request';
import { bearer, createUser } from '../helpers/factories';
import { withStaticFile } from '../helpers/files';

/*
 * What every response carries, whatever the endpoint: the security headers,
 * CORS for the web's origins, the legacy `/static` files, and a 404 for an
 * unknown path.
 */

const WEB_ORIGIN = 'https://our.snuaaa.net';

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "font-src 'self' https: data:",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "img-src 'self' data:",
  "object-src 'none'",
  "script-src 'self'",
  "script-src-attr 'none'",
  "style-src 'self' https: 'unsafe-inline'",
  'upgrade-insecure-requests',
];

const SECURITY_HEADERS = {
  'cross-origin-opener-policy': 'same-origin',
  // The web is on another origin and shows `/static` images.
  'cross-origin-resource-policy': 'cross-origin',
  'origin-agent-cluster': '?1',
  'referrer-policy': 'no-referrer',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'x-content-type-options': 'nosniff',
  'x-dns-prefetch-control': 'off',
  'x-download-options': 'noopen',
  'x-frame-options': 'SAMEORIGIN',
  'x-permitted-cross-domain-policies': 'none',
  'x-xss-protection': '0',
};

describe('every response', () => {
  it('carries the security headers, on success and on error', async () => {
    const user = await createUser();

    const responses = [
      await api().get('/api/board').set('Authorization', bearer(user)),
      await api().get('/api/board'),
    ];

    expect(responses.map((response) => response.status)).toEqual([200, 401]);
    for (const response of responses) {
      expect(response.headers).toEqual(
        expect.objectContaining(SECURITY_HEADERS),
      );
      expect(response.headers['content-security-policy'].split(/;\s*/)).toEqual(
        CONTENT_SECURITY_POLICY,
      );
    }
  });

  it("allows the web's origin, and no other", async () => {
    const user = await createUser();

    const allowed = await api()
      .get('/api/board')
      .set('Authorization', bearer(user))
      .set('Origin', WEB_ORIGIN);
    const other = await api()
      .get('/api/board')
      .set('Authorization', bearer(user))
      .set('Origin', 'https://evil.example');

    expect(allowed.headers['access-control-allow-origin']).toBe(WEB_ORIGIN);
    expect(allowed.headers.vary).toMatch(/Origin/);
    expect(other.headers).not.toHaveProperty('access-control-allow-origin');
  });

  it('answers a preflight for an authorized PATCH with a JSON body', async () => {
    const response = await api()
      .options('/api/user')
      .set('Origin', WEB_ORIGIN)
      .set('Access-Control-Request-Method', 'PATCH')
      .set('Access-Control-Request-Headers', 'authorization,content-type');

    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(300);
    expect(response.headers['access-control-allow-origin']).toBe(WEB_ORIGIN);
    expect(response.headers['access-control-allow-methods']).toMatch(/PATCH/);
    expect(response.headers['access-control-allow-headers']).toBe(
      'authorization,content-type',
    );
  });

  it('serves the legacy files in `upload/` under /static', async () => {
    const response = await withStaticFile('hello.txt', Buffer.from('hi'), () =>
      api().get('/static/test/hello.txt'),
    );

    expect(response.status).toBe(200);
    expect(response.text).toBe('hi');
    expect(response.headers['cross-origin-resource-policy']).toBe(
      'cross-origin',
    );
  });

  it('answers 404 to an unknown path', async () => {
    const responses = [
      await api().get('/api/nothing'),
      await api().get('/static/test/none.txt'),
      await api().get('/'),
    ];

    expect(responses.map((response) => response.status)).toEqual([
      404, 404, 404,
    ]);
  });
});
