import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import {
  bearer,
  createBoard,
  createContent,
  createContentLike,
  createUser,
} from './helpers/factories';
import {
  contentCounters,
  hasContentLike,
  withFailingWrites,
  withRowsLocked,
} from './helpers/db';

async function setup() {
  const board = await createBoard({ lv_read: 10, lv_write: 10 });
  const author = await createUser({ grade: 8 });
  const contentId = await createContent(author, board, { like_num: 3 });
  const user = await createUser({ grade: 8 });
  return { contentId, user };
}

describe('POST /api/content/:content_id/like', () => {
  it('likes, then unlikes on the second call, keeping like_num in step', async () => {
    const { contentId, user } = await setup();

    const first = await api()
      .post(`/api/content/${contentId}/like`)
      .set('Authorization', bearer(user));
    expect(first.status).toBe(200);
    expect(first.body).toEqual({ success: true });
    expect(await hasContentLike(user, contentId)).toBe(true);
    expect((await contentCounters(contentId)).like_num).toBe(4);

    const second = await api()
      .post(`/api/content/${contentId}/like`)
      .set('Authorization', bearer(user));
    expect(second.status).toBe(200);
    expect(await hasContentLike(user, contentId)).toBe(false);
    expect((await contentCounters(contentId)).like_num).toBe(3);
  });

  it('keeps no like when like_num fails to update', async () => {
    const { contentId, user } = await setup();

    const res = await withFailingWrites('tb_content', 'UPDATE', () =>
      api()
        .post(`/api/content/${contentId}/like`)
        .set('Authorization', bearer(user)),
    );

    expect(res.status).toBe(500);
    expect(await hasContentLike(user, contentId)).toBe(false);
    expect((await contentCounters(contentId)).like_num).toBe(3);
  });

  it('keeps the like when like_num fails to update on unlike', async () => {
    const { contentId, user } = await setup();
    await createContentLike(user, contentId);

    const res = await withFailingWrites('tb_content', 'UPDATE', () =>
      api()
        .post(`/api/content/${contentId}/like`)
        .set('Authorization', bearer(user)),
    );

    expect(res.status).toBe(500);
    expect(await hasContentLike(user, contentId)).toBe(true);
    expect((await contentCounters(contentId)).like_num).toBe(3);
  });

  it('handles two calls at once as like then unlike', async () => {
    const { contentId, user } = await setup();

    const responses = await Promise.all([
      api()
        .post(`/api/content/${contentId}/like`)
        .set('Authorization', bearer(user)),
      api()
        .post(`/api/content/${contentId}/like`)
        .set('Authorization', bearer(user)),
    ]);

    expect(responses.map((r) => r.status)).toEqual([200, 200]);
    expect(await hasContentLike(user, contentId)).toBe(false);
    expect((await contentCounters(contentId)).like_num).toBe(3);
  });

  it('gives up with a 500 instead of waiting forever on a held lock', async () => {
    const { contentId, user } = await setup();

    const res = await withRowsLocked(
      'tb_content',
      { content_id: contentId },
      () =>
        api()
          .post(`/api/content/${contentId}/like`)
          .set('Authorization', bearer(user)),
    );

    expect(res.status).toBe(500);
    expect(await hasContentLike(user, contentId)).toBe(false);
    expect((await contentCounters(contentId)).like_num).toBe(3);
  });

  it('returns 404 for an unknown content', async () => {
    const user = await createUser({ grade: 8 });

    const res = await api()
      .post('/api/content/999999/like')
      .set('Authorization', bearer(user));

    expect(res.status).toBe(404);
  });
});
