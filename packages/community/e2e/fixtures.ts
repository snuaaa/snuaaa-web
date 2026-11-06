import { test as base, expect, type Page } from '@playwright/test';
import { API_ORIGIN, BASE_URL } from '../playwright.config';

export const VALID_TOKEN = 'valid-token';
export const EXPIRED_TOKEN = 'expired-token';

const member = {
  user_id: 1,
  user_uuid: 'member-uuid',
  nickname: 'tester',
  grade: 5,
  level: 1,
  profile_path: '',
};

const guest = {
  user_id: -1,
  grade: 10,
  level: 0,
  profile_path: null,
  nickname: 'guest',
};

type MockApi = {
  /** Every API call the page made, as `METHOD /path` (without `/api`). */
  requests: string[];
  /** Status `/auth/check` answers with for a valid token. */
  checkStatus: 200 | 500;
  count: (pattern: string) => number;
};

/** Responses for endpoints the pages read; everything else gets `[]`. */
function bodyFor(path: string) {
  if (path.startsWith('/home/soundbox')) {
    return { content_id: 1, title: 'soundbox', text: '' };
  }
  if (path.startsWith('/home/riseset')) {
    return { lunAge: 1 };
  }
  if (path.startsWith('/userinfo')) {
    return { userInfo: member };
  }
  return [];
}

async function mockApi(page: Page, api: MockApi) {
  await page.route(`${API_ORIGIN}/api/**`, async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace(/^\/api/, '');
    api.requests.push(`${request.method()} ${path}`);

    const json = (status: number, body: unknown) =>
      route.fulfill({ status, json: body });
    const token = request.headers().authorization?.replace(/^Bearer /, '');

    if (path.startsWith('/auth/login/guest')) {
      return json(200, { userInfo: guest, autoLogin: false, token: 'guest' });
    }
    if (path.startsWith('/auth/login')) {
      return json(200, {
        userInfo: member,
        autoLogin: false,
        token: VALID_TOKEN,
      });
    }
    if (!token || token === EXPIRED_TOKEN) {
      return json(401, { success: false });
    }
    if (path.startsWith('/auth/check')) {
      if (api.checkStatus !== 200) {
        return json(api.checkStatus, { success: false });
      }
      return json(200, { userInfo: member, autoLogin: false, token });
    }
    return json(200, bodyFor(path));
  });
}

/**
 * - `api`: the mocked API, with the requests it received.
 * - Fails the test if the page hit a render loop or showed the router's
 *   error screen, which is how the auth bugs behind these tests showed up.
 *   A test that expects the error screen opts out with
 *   `test.use({ allowRouteError: true })`.
 */
export const test = base.extend<{ api: MockApi; allowRouteError: boolean }>({
  allowRouteError: [false, { option: true }],
  // auto: mock the API even in tests that don't read `api`
  api: [
    async ({ page }, use) => {
      const api: MockApi = {
        requests: [],
        checkStatus: 200,
        count: (pattern) =>
          api.requests.filter((r) => r.includes(pattern)).length,
      };
      await mockApi(page, api);
      await use(api);
    },
    { auto: true },
  ],
  page: async ({ page, allowRouteError }, use) => {
    const loopErrors: string[] = [];
    const routeErrors: string[] = [];
    page.on('console', (message) => {
      const text = message.text();
      if (text.includes('Maximum update depth')) loopErrors.push(text);
      if (text.includes('Error in route match')) routeErrors.push(text);
    });
    await use(page);
    expect(loopErrors, 'render loop').toEqual([]);
    if (!allowRouteError) {
      expect(routeErrors, 'route error screen').toEqual([]);
    }
  },
});

export { expect };

export async function setToken(page: Page, token: string) {
  await page
    .context()
    .addCookies([{ name: 'token', value: token, url: BASE_URL }]);
}

export async function getToken(page: Page) {
  const cookies = await page.context().cookies();
  return cookies.find((cookie) => cookie.name === 'token')?.value;
}

export async function logIn(page: Page) {
  await page.getByPlaceholder('아이디').fill('member');
  await page.getByPlaceholder('비밀번호').fill('password');
  await page.getByRole('button', { name: '로그인', exact: true }).click();
}
