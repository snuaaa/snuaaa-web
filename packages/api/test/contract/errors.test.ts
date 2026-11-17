import { describe, expect, it } from 'vitest';
import { api } from '../helpers/request';
import { bearer, createUser } from '../helpers/factories';
import { withTableMissing } from '../helpers/db';

describe('error response format', () => {
  it('answers malformed JSON with 400', async () => {
    const res = await api()
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"id": ');

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, error: 'BAD_REQUEST' });
  });

  it('answers a duplicate signup id with 409', async () => {
    await createUser({ id: 'taken' });

    const res = await api().post('/api/auth/signup').send({
      id: 'taken',
      password: 'password1234',
      passwordCf: 'password1234',
      username: 'Someone',
      nickname: 'someone',
      email: 'someone@example.com',
      mobile: '010-0000-0000',
    });

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({ success: false, error: 'CONFLICT' });
  });

  it('answers an unexpected error with a generic 500', async () => {
    const user = await createUser();

    // The endpoint's query fails like it would on a broken DB.
    const res = await withTableMissing('tb_board', () =>
      api().get('/api/board').set('Authorization', bearer(user)),
    );

    expect(res.status).toBe(500);
    // No message or stack from the original error reaches the client.
    expect(res.body).toEqual({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    });
  });
});
