import { test, expect, setToken, VALID_TOKEN } from './fixtures';
import { API_ORIGIN } from '../playwright.config';

const generations = [
  {
    generation: 93,
    president: '김성윤',
    roles: [
      { role: '부회장', names: ['박현우'] },
      { role: '관측부장', names: ['김민성', '김민주'] },
    ],
    updated_at: '2026-11-23T00:00:00.000Z',
  },
  {
    generation: 92,
    president: '박시원',
    roles: [{ role: '총무', names: ['박현우'] }],
    updated_at: '2026-11-23T00:00:00.000Z',
  },
  {
    generation: 91,
    president: '최상욱',
    roles: [{ role: '총무', names: ['박시원'] }],
    updated_at: '2026-11-23T00:00:00.000Z',
  },
];

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

  test('임원은 다음 기수를 추가한다', async ({ page }) => {
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

    await edit.click();
    const dialog = page.getByRole('dialog', { name: '93대 수정' });
    await expect(dialog.getByRole('button', { name: '삭제' })).toHaveCount(0);
  });

  test('이름이 빈 직책은 저장하지 않는다', async ({ page, api }) => {
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
