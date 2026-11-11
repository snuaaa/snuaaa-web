import { test, expect, setToken, VALID_TOKEN } from './fixtures';
import { API_ORIGIN } from '../playwright.config';

const IMAGE_ORIGIN = 'http://img.e2e.test';
// 1x1 transparent PNG
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

const album = { content_id: 100, title: '테스트 앨범', author_id: 1 };
const user = { user_id: 2, user_uuid: 'author-uuid', nickname: 'author' };

/** Photos 1–3 in one album; `nextPhoto` is the newer one. */
function photo(id: number) {
  return {
    content_id: id,
    author_id: 2,
    board_id: 'brd10',
    title: `사진 ${id}`,
    text: '',
    view_num: 0,
    like_num: 0,
    comment_num: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    user,
    parent: album,
    tags: [],
    photo: { img_url: `${IMAGE_ORIGIN}/${id}.png` },
  };
}

function detail(id: number) {
  return {
    photoInfo: photo(id),
    likeInfo: false,
    boardTagInfo: [],
    prevPhoto: id > 1 ? photo(id - 1) : null,
    nextPhoto: id < 3 ? photo(id + 1) : null,
  };
}

test.describe('사진 상세 (데스크탑)', () => {
  test.beforeEach(async ({ page }) => {
    await setToken(page, VALID_TOKEN);
    await page.route(`${IMAGE_ORIGIN}/**`, (route) =>
      route.fulfill({ contentType: 'image/png', body: PNG }),
    );
  });

  test('사진을 넘기는 동안 모달 틀과 화살표를 유지한다', async ({ page }) => {
    let release: () => void = () => {};
    await page.route(`${API_ORIGIN}/api/photo/*`, async (route) => {
      const id = Number(new URL(route.request().url()).pathname.split('/')[3]);
      // Hold photo 1 until the test has checked the loading state.
      if (id === 1) await new Promise<void>((r) => (release = r));
      await route.fulfill({ json: detail(id) });
    });

    await page.goto('/?photo=2');
    const dialog = page.getByRole('dialog', { name: '사진 2' });
    await expect(dialog.getByRole('heading', { name: '사진 2' })).toBeVisible();

    await dialog.getByRole('button', { name: '다음 사진' }).click();

    // While photo 1 loads, the frame stays: the stage shows photo 1's image
    // (known from photo 2's neighbors), the panel shows a skeleton, and the
    // arrows stay in place but inactive.
    const loading = page.getByRole('dialog', { name: '사진' });
    await expect(loading.locator('aside[aria-busy="true"]')).toBeVisible();
    await expect(loading.getByRole('img', { name: '사진 1' })).toBeVisible();
    await expect(
      loading.getByRole('button', { name: '이전 사진' }),
    ).toBeDisabled();
    await expect(loading.getByText('테스트 앨범')).toBeVisible();

    release();
    const next = page.getByRole('dialog', { name: '사진 1' });
    await expect(next.getByRole('heading', { name: '사진 1' })).toBeVisible();
    await expect(next.getByRole('button', { name: '이전 사진' })).toBeEnabled();
    await expect(next.getByRole('button', { name: '다음 사진' })).toHaveCount(
      0,
    );
  });
});

test.describe('사진 상세 (모바일)', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test.beforeEach(async ({ page }) => {
    await setToken(page, VALID_TOKEN);
    await page.route(`${IMAGE_ORIGIN}/**`, (route) =>
      route.fulfill({ contentType: 'image/png', body: PNG }),
    );
  });

  test('사진을 넘기는 동안 화면 구성을 유지한다', async ({ page }) => {
    let release: () => void = () => {};
    await page.route(`${API_ORIGIN}/api/photo/*`, async (route) => {
      const id = Number(new URL(route.request().url()).pathname.split('/')[3]);
      if (id === 1) await new Promise<void>((r) => (release = r));
      await route.fulfill({ json: detail(id) });
    });

    await page.goto('/?photo=2');
    const dialog = page.getByRole('dialog', { name: '사진 2' });
    await expect(dialog.getByRole('heading', { name: '사진 2' })).toBeVisible();

    await page.keyboard.press('ArrowRight');

    // The header and the stage stay; only the details below load.
    const loading = page.getByRole('dialog', { name: '사진' });
    await expect(loading.getByRole('img', { name: '사진 1' })).toBeVisible();
    await expect(loading.getByText('테스트 앨범')).toBeVisible();
    await expect(loading.getByRole('button', { name: '닫기' })).toBeVisible();
    await expect(loading.getByRole('heading')).toHaveCount(0);

    release();
    await expect(
      page
        .getByRole('dialog', { name: '사진 1' })
        .getByRole('heading', { name: '사진 1' }),
    ).toBeVisible();
  });
});
