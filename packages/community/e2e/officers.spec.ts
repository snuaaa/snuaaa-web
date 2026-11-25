import type { Page } from '@playwright/test';
import { test, expect, setToken, VALID_TOKEN } from './fixtures';
import { API_ORIGIN } from '../playwright.config';

const generations = [
  {
    generation: 93,
    president: '김성윤',
    // The fixture's member (grade 5) started this 기수: 현 회장.
    president_uuid: 'member-uuid',
    roles: [
      { role: '부회장', names: ['박현우'] },
      { role: '관측부장', names: ['김민성', '김민주'] },
    ],
    updated_at: '2026-11-23T00:00:00.000Z',
  },
  {
    generation: 92,
    president: '박시원',
    president_uuid: null,
    roles: [{ role: '총무', names: ['박현우'] }],
    updated_at: '2026-11-23T00:00:00.000Z',
  },
  {
    generation: 91,
    president: '최상욱',
    president_uuid: null,
    roles: [{ role: '총무', names: ['박시원'] }],
    updated_at: '2026-11-23T00:00:00.000Z',
  },
];

/** Signs in as 운영진 (grade 3) instead of the fixture's 현 회장. */
async function signInAsManager(page: Page) {
  await page.route(`${API_ORIGIN}/api/auth/check**`, (route) =>
    route.fulfill({
      json: {
        userInfo: {
          user_id: 2,
          user_uuid: 'manager-uuid',
          nickname: 'manager',
          grade: 3,
          level: 1,
          profile_path: '',
        },
        autoLogin: false,
        token: VALID_TOKEN,
      },
    }),
  );
}

test.describe('임원진', () => {
  test.beforeEach(async ({ page }) => {
    await setToken(page, VALID_TOKEN);
  });

  test('기수를 별로 보여 주고 이름을 누르면 그 사람의 기수를 찾는다', async ({
    page,
  }) => {
    await page.route(`${API_ORIGIN}/api/officers`, (route) =>
      route.fulfill({ json: { success: true, generations } }),
    );

    // Reached from the footer link, not a main menu item.
    await page.goto('/');
    await page
      .getByRole('contentinfo')
      .getByRole('link', { name: '역대 임원진' })
      .click();
    await expect(page).toHaveURL(/\/officers$/);
    const timeline = page.getByRole('list', { name: '기수 타임라인' });
    await expect(timeline.getByRole('listitem')).toHaveCount(3);
    await expect(timeline.getByText('김민주')).toBeVisible();

    // Tapping a name finds every 기수 that person served in:
    // 박시원 was 92대 회장 and 91대 총무.
    await timeline.getByRole('button', { name: '박시원' }).first().click();
    await expect(page.getByLabel('이름이나 직책으로 찾기')).toHaveValue(
      '박시원',
    );
    const found = page.getByRole('region', { name: '찾은 기록' });
    await expect(found).toContainText('2개 기수에서 찾았어요');
    await expect(
      found.getByRole('button', { name: '92대 회장' }),
    ).toBeVisible();
    await expect(
      found.getByRole('button', { name: '91대 총무' }),
    ).toBeVisible();
    await expect(timeline.locator('mark', { hasText: '박시원' })).toHaveCount(
      2,
    );

    await found.getByRole('button', { name: '지우기' }).click();
    await expect(page.getByLabel('이름이나 직책으로 찾기')).toHaveValue('');
    await expect(timeline.locator('mark')).toHaveCount(0);
  });

  test('운영진은 기수를 직접 추가한다', async ({ page }) => {
    await signInAsManager(page);
    const saved: unknown[] = [];
    await page.route(`${API_ORIGIN}/api/officers**`, (route) => {
      const request = route.request();
      if (request.method() === 'PUT') {
        saved.push([new URL(request.url()).pathname, request.postDataJSON()]);
        return route.fulfill({ json: { success: true } });
      }
      return route.fulfill({ json: { success: true, generations } });
    });

    await page.goto('/officers');
    await page.getByRole('button', { name: '기수 추가' }).click();
    const dialog = page.getByRole('dialog', { name: '기수 추가' });
    // Starts from the next number and the latest 기수's roles.
    await expect(
      dialog.getByRole('textbox', { name: '기수', exact: true }),
    ).toHaveValue('94');
    await dialog
      .getByRole('textbox', { name: '회장', exact: true })
      .fill('홍길동');
    await dialog.getByLabel('부회장 이름', { exact: true }).fill('김철수');
    await dialog
      .getByLabel('관측부장 이름', { exact: true })
      .fill('이영희, 박민수');
    await dialog.getByRole('button', { name: '저장' }).click();

    await expect(dialog).toBeHidden();
    expect(saved).toEqual([
      [
        '/api/officers/94',
        {
          president: '홍길동',
          roles: [
            { role: '부회장', names: ['김철수'] },
            { role: '관측부장', names: ['이영희', '박민수'] },
          ],
        },
      ],
    ]);
  });

  test('현 회장은 지금 기수만 고치고 지난 기수는 고칠 수 없다', async ({
    page,
  }) => {
    // The fixture's member is grade 5 (현 회장).
    await page.route(`${API_ORIGIN}/api/officers`, (route) =>
      route.fulfill({ json: { success: true, generations } }),
    );

    await page.goto('/officers');
    const edit = page.getByRole('button', { name: '93대 수정' });
    await expect(edit).toBeVisible();
    await expect(page.getByRole('button', { name: '92대 수정' })).toHaveCount(
      0,
    );

    // A new 기수 comes from 회기 넘기기, not by hand.
    await expect(page.getByRole('button', { name: '기수 추가' })).toHaveCount(
      0,
    );

    await edit.click();
    const dialog = page.getByRole('dialog', { name: '93대 수정' });
    await expect(dialog.getByRole('button', { name: '삭제' })).toHaveCount(0);
  });

  test('다른 기수의 회장 계정이면 지금 기수를 고칠 수 없다', async ({
    page,
  }) => {
    const otherPresident = generations.map((g, index) =>
      index === 0 ? { ...g, president_uuid: 'someone-else' } : g,
    );
    await page.route(`${API_ORIGIN}/api/officers`, (route) =>
      route.fulfill({ json: { success: true, generations: otherPresident } }),
    );

    await page.goto('/officers');
    await expect(
      page.getByRole('list', { name: '기수 타임라인' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: '93대 수정' })).toHaveCount(
      0,
    );
    await expect(page.getByRole('button', { name: '회기 넘기기' })).toHaveCount(
      0,
    );
  });

  test('현 회장은 새 회장을 골라 회기를 넘긴다', async ({ page }) => {
    const handedOver: unknown[] = [];
    await page.route(`${API_ORIGIN}/api/officers**`, (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        handedOver.push(request.postDataJSON());
        return route.fulfill({ json: { success: true } });
      }
      return route.fulfill({ json: { success: true, generations } });
    });
    await page.route(`${API_ORIGIN}/api/userinfo/search/mini**`, (route) =>
      route.fulfill({
        json: {
          success: true,
          userList: [
            {
              user_uuid: 'next-uuid',
              username: '홍길동',
              nickname: 'gildong',
              profile_path: '',
            },
          ],
        },
      }),
    );

    await page.goto('/officers');
    await page.getByRole('button', { name: '회기 넘기기' }).click();
    const dialog = page.getByRole('dialog', { name: '회기 넘기기' });
    await expect(dialog).toContainText('93대를 마치고 94대를 시작해요.');
    const submit = dialog.getByRole('button', { name: '94대로 넘기기' });
    await expect(submit).toBeDisabled();

    await dialog.getByPlaceholder('이름').fill('홍길');
    await dialog
      .getByRole('list', { name: '회원 검색 결과' })
      .getByRole('button', { name: /홍길동/ })
      .click();
    await expect(dialog).toContainText('홍길동 님은 목성(현 회장)이 되고');
    await submit.click();

    await expect(dialog).toBeHidden();
    await expect(page.getByText('94대를 시작했어요')).toBeVisible();
    expect(handedOver).toEqual([{ president_uuid: 'next-uuid' }]);
  });

  test('이름이 빈 직책은 저장하지 않는다', async ({ page, api }) => {
    await signInAsManager(page);
    await page.route(`${API_ORIGIN}/api/officers`, (route) =>
      route.fulfill({ json: { success: true, generations } }),
    );

    await page.goto('/officers');
    await page.getByRole('button', { name: '기수 추가' }).click();
    const dialog = page.getByRole('dialog', { name: '기수 추가' });
    await dialog
      .getByRole('textbox', { name: '회장', exact: true })
      .fill('홍길동');
    await dialog.getByRole('button', { name: '저장' }).click();

    await expect(dialog.getByText('이름을 적어 주세요.').first()).toBeVisible();
    expect(api.count('PUT /officers')).toBe(0);
  });
});
