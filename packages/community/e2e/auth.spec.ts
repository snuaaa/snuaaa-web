import {
  test,
  expect,
  EXPIRED_TOKEN,
  VALID_TOKEN,
  getToken,
  logIn,
  setToken,
} from './fixtures';

const loginPage = (redirect: string) =>
  new RegExp(`/auth/login\\?redirect=${encodeURIComponent(redirect)}$`);

test.describe('비로그인', () => {
  test('보호된 페이지는 데이터 요청 없이 로그인 페이지로 보낸다', async ({
    page,
    api,
  }) => {
    await page.goto('/');

    await expect(page).toHaveURL(loginPage('/'));
    await expect(page.getByPlaceholder('아이디')).toBeVisible();
    // The route guard runs before the home loader, so no 401 error flash.
    await expect(page.getByText('Something went wrong')).toHaveCount(0);
    expect(api.requests).toEqual([]);
  });

  test('로그인하면 메인 페이지로 이동한다', async ({ page }) => {
    await page.goto('/auth/login');
    await logIn(page);

    await expect(page).toHaveURL('/');
    await expect(page.getByLabel('내 메뉴')).toBeVisible();
    expect(await getToken(page)).toBe(VALID_TOKEN);
  });

  test('딥링크는 쿼리스트링까지 유지해서 로그인 후 돌아온다', async ({
    page,
  }) => {
    await page.goto('/posts/all?page=2');
    await expect(page).toHaveURL(loginPage('/posts/all?page=2'));

    await logIn(page);
    await expect(page).toHaveURL('/posts/all?page=2');
  });

  test('게스트 로그인도 redirect로 돌아온다', async ({ page }) => {
    await page.goto('/auth/login?redirect=%2Fequipment');
    await page.getByRole('button', { name: '게스트로 둘러보기' }).click();

    await expect(page).toHaveURL('/equipment');
  });

  for (const redirect of [
    'https://example.com',
    '//example.com',
    '/\\example.com',
    // Browsers drop tabs and newlines from URLs, so this becomes //example.com
    '/\t/example.com',
  ]) {
    test(`외부 주소 redirect(${redirect})는 무시하고 메인으로 보낸다`, async ({
      page,
    }) => {
      await page.goto(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
      await logIn(page);

      await expect(page).toHaveURL('/');
    });
  }
});

test.describe('로그인 상태', () => {
  test.beforeEach(async ({ page }) => {
    await setToken(page, VALID_TOKEN);
  });

  test('새로고침해도 로그인이 유지된다', async ({ page, api }) => {
    await page.goto('/');

    await expect(page).toHaveURL('/');
    await expect(page.getByLabel('내 메뉴')).toBeVisible();
    expect(api.count('GET /auth/check')).toBe(1);
  });

  test('로그인 페이지에 들어오면 원래 가려던 곳으로 보낸다', async ({
    page,
  }) => {
    await page.goto('/auth/login?redirect=%2Fequipment');

    await expect(page).toHaveURL('/equipment');
  });

  test('페이지 이동마다 토큰을 다시 확인하지 않는다', async ({ page, api }) => {
    await page.goto('/');
    await expect(page.getByLabel('내 메뉴')).toBeVisible();

    await page.locator('a[href="/equipment"]').first().click();
    await expect(page).toHaveURL('/equipment');
    await page.goBack();
    await expect(page).toHaveURL('/');

    expect(api.count('GET /auth/check')).toBe(1);
  });

  test('다른 탭에서 로그아웃했으면 다음 이동 때 로그인 페이지로 보낸다', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByLabel('내 메뉴')).toBeVisible();

    await page.context().clearCookies();
    await page.locator('a[href="/equipment"]').first().click();

    await expect(page).toHaveURL(loginPage('/equipment'));
  });

  test('페이지에 머무는 동안 세션이 만료되면 로그인 페이지로 보낸다', async ({
    page,
    api,
  }) => {
    await page.clock.install();
    await page.goto('/');
    await expect(page.getByLabel('내 메뉴')).toBeVisible();

    // The session goes stale after 5 minutes and is revalidated on reconnect.
    api.checkStatus = 401;
    await page.clock.fastForward('06:00');
    await page.context().setOffline(true);
    await page.context().setOffline(false);

    await expect(page).toHaveURL(loginPage('/'));
  });

  test('로그아웃하면 토큰을 지우고 로그인 페이지로 보낸다', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByLabel('내 메뉴').click();
    await page.getByRole('menuitem', { name: '로그아웃' }).click();

    await expect(page).toHaveURL(/\/auth\/login$/);
    expect(await getToken(page)).toBeUndefined();

    await page.goto('/');
    await expect(page).toHaveURL(loginPage('/'));
  });
});

test.describe('토큰 확인 실패', () => {
  test('만료된 토큰(401)은 로그아웃시킨다', async ({ page }) => {
    await setToken(page, EXPIRED_TOKEN);
    await page.goto('/');

    await expect(page).toHaveURL(loginPage('/'));
    expect(await getToken(page)).toBeUndefined();
  });

  test('다른 탭에서 로그인했으면 로그인 페이지에서 원래 곳으로 보낸다', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page).toHaveURL(loginPage('/'));

    await setToken(page, VALID_TOKEN);
    await page
      .getByRole('link', { name: '회원가입' })
      .filter({ visible: true })
      .click();
    await expect(page).toHaveURL('/auth/signup');
    await page.goBack();

    await expect(page).toHaveURL('/');
  });

  test('세션 확인이 실패해도 로그인 페이지는 열린다', async ({ page, api }) => {
    api.checkStatus = 500;
    await setToken(page, VALID_TOKEN);
    await page.goto('/auth/login');

    await expect(page.getByPlaceholder('아이디')).toBeVisible();
    await logIn(page);
    await expect(page).toHaveURL('/');
  });

  test.describe(() => {
    test.use({ allowRouteError: true });

    test('서버 에러는 로그아웃시키지 않는다', async ({ page, api }) => {
      api.checkStatus = 500;
      await setToken(page, VALID_TOKEN);
      await page.goto('/');

      await expect(page.getByText('Something went wrong')).toBeVisible();
      await expect(page).toHaveURL('/');
      expect(await getToken(page)).toBe(VALID_TOKEN);

      api.checkStatus = 200;
      await page.getByRole('button', { name: '다시 시도' }).click();
      await expect(page.getByLabel('내 메뉴')).toBeVisible();
    });
  });
});
