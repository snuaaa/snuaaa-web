import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import { bearer, createBoard, createUser } from './helpers/factories';

describe('GET /api/board', () => {
  it('lists only the boards the grade can read, in menu order', async () => {
    await createBoard({ board_id: 'b_all', menu: 1, order: 2, lv_read: 10 });
    await createBoard({ board_id: 'b_member', menu: 1, order: 1, lv_read: 8 });
    await createBoard({ board_id: 'b_admin', menu: 0, order: 1, lv_read: 1 });

    const member = await createUser({ grade: 8 });
    const res = await api()
      .get('/api/board')
      .set('Authorization', await bearer(member));

    expect(res.status).toBe(200);
    expect(res.body.map((b) => b.board_id)).toEqual(['b_member', 'b_all']);
    expect(res.body[0]).toMatchObject({ tags: [], categories: [] });
  });

  it('requires a token', async () => {
    const res = await api().get('/api/board');

    expect(res.status).toBe(401);
  });
});
