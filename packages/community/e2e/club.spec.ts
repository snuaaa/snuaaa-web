import { test, expect, setToken, VALID_TOKEN } from './fixtures';
import { API_ORIGIN } from '../playwright.config';

/** Signs in as 천왕성 (grade 7), who has no 운영 screens. */
async function signInAsMember(page: import('@playwright/test').Page) {
  await page.route(`${API_ORIGIN}/api/auth/check**`, (route) =>
    route.fulfill({
      json: {
        userInfo: {
          user_id: 3,
          user_uuid: 'uranus-uuid',
          nickname: 'uranus',
          grade: 7,
          level: 1,
          profile_path: '',
        },
        autoLogin: false,
        token: VALID_TOKEN,
      },
    }),
  );
}

test.describe('동아리', () => {
  test.beforeEach(async ({ page }) => {
    await setToken(page, VALID_TOKEN);
  });

  test('동아리에서 회칙을 찾아 본다', async ({ page }) => {
    await page.goto('/');
    // The footer only holds the copyright; 동아리 is in the main menu.
    await expect(page.getByRole('contentinfo').getByRole('link')).toHaveCount(
      0,
    );
    await page
      .getByRole('navigation', { name: '주 메뉴' })
      .first()
      .getByRole('link', { name: '동아리', exact: true })
      .click();
    await expect(page).toHaveURL(/\/club$/);

    // The fixture's member is 현 회장 (5): 운영 shows 회원 관리, and 활동
    // has 장비 대여.
    const manage = page.getByRole('region', { name: '운영' });
    await expect(manage.getByRole('link', { name: /회원 관리/ })).toBeVisible();
    await expect(
      page.getByRole('region', { name: '활동' }).getByRole('link', {
        name: /장비 대여/,
      }),
    ).toBeVisible();

    await page.getByRole('link', { name: /회칙/ }).click();
    await expect(page).toHaveURL(/\/club\/rules$/);
    await expect(
      page.getByRole('heading', { name: '제1조(명칭)' }),
    ).toBeVisible();
    await expect(page.getByRole('region', { name: '부칙' })).toBeAttached();

    // A search keeps only the 조 that mention it.
    await page
      .getByLabel('조문 찾기')
      .locator('visible=true')
      .fill('선거관리위원회');
    await expect(
      page.getByText(/개 조에서 찾았어요/).locator('visible=true'),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '제1조(명칭)' }),
    ).toHaveCount(0);

    // Spaces don't matter, in the search or in the marks.
    await page
      .getByLabel('조문 찾기')
      .locator('visible=true')
      .fill('임원 모임');
    await expect(
      page.locator('mark').filter({ hasText: '임원모임' }).first(),
    ).toBeVisible();

    await page
      .getByLabel('조문 찾기')
      .locator('visible=true')
      .fill('없는낱말입니다');
    await expect(page.getByText('다른 낱말로 찾아 보세요.')).toBeVisible();
  });

  test('운영 등급이 아니면 운영 칸이 없다', async ({ page }) => {
    await signInAsMember(page);
    await page.goto('/club');
    await expect(page.getByRole('region', { name: '기록' })).toBeVisible();
    await expect(page.getByRole('region', { name: '운영' })).toHaveCount(0);
  });

  test('모바일은 하단 동아리 탭에서 장비 대여로 간다', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const tabs = page.getByRole('navigation', { name: '주 메뉴' }).last();
    await tabs.getByRole('link', { name: '동아리' }).click();
    await expect(page).toHaveURL(/\/club$/);
    await page.getByRole('link', { name: /장비 대여/ }).click();
    await expect(page).toHaveURL(/\/equipment$/);
    // 장비 대여 stays under the 동아리 tab.
    await expect(tabs.getByRole('link', { name: '동아리' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('데스크톱은 주 메뉴에서 동아리로 간다', async ({ page }) => {
    await page.goto('/posts/all');
    await page
      .getByRole('navigation', { name: '주 메뉴' })
      .getByRole('link', { name: '동아리', exact: true })
      .click();
    await expect(page).toHaveURL(/\/club$/);
    await expect(
      page
        .getByRole('navigation', { name: '주 메뉴' })
        .getByRole('link', { name: '동아리', exact: true }),
    ).toHaveAttribute('data-active', 'true');
  });
});
