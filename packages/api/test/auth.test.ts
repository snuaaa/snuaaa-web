import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import { bearer, createUser, DEFAULT_PASSWORD } from './helpers/factories';

describe('POST /api/auth/login', () => {
  it('returns a token and the user without the password', async () => {
    const user = await createUser({ id: 'aaa', grade: 7 });

    const res = await api()
      .post('/api/auth/login')
      .send({ id: 'aaa', password: DEFAULT_PASSWORD });

    expect(res.status).toBe(200);
    // The typo is the current contract; the web does not read this field.
    expect(res.body.sucess).toBe(true);
    expect(res.body.autoLogin).toBe(false);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.userInfo).toMatchObject({
      user_id: user.get('user_id'),
      id: 'aaa',
      grade: 7,
    });
    expect(res.body.userInfo).not.toHaveProperty('password');
    expect(res.headers['set-cookie']?.[0]).toMatch(/^token=/);
  });

  it.each([
    ['a wrong password', { id: 'aaa', password: 'wrong' }],
    ['an unknown id', { id: 'nobody', password: DEFAULT_PASSWORD }],
    ['no password', { id: 'aaa' }],
  ])('rejects %s with 401', async (_case, body) => {
    await createUser({ id: 'aaa' });

    const res = await api().post('/api/auth/login').send(body);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      error: 'UNAUTHENTICATED',
      message: 'Login Info is not valid.',
    });
  });
});

describe('GET /api/auth/check', () => {
  it('returns the user and a fresh token for a valid token', async () => {
    const user = await createUser({ grade: 5 });

    const res = await api()
      .get('/api/auth/check')
      .set('Authorization', await bearer(user));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.userInfo).toMatchObject({
      user_id: user.get('user_id'),
      grade: 5,
    });
    expect(typeof res.body.token).toBe('string');
  });

  it.each([
    ['no Authorization header', undefined, 'Authorization does not exist.'],
    ['a non-Bearer header', 'Basic abc', 'Token Type Error.'],
    ['an invalid token', 'Bearer not-a-jwt', 'Token is not valid.'],
  ])('rejects %s with 401', async (_case, header, message) => {
    const req = api().get('/api/auth/check');
    if (header) {
      req.set('Authorization', header);
    }

    const res = await req;

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      error: 'UNAUTHENTICATED',
      message,
    });
  });

  it('rejects a token whose user no longer exists', async () => {
    const user = await createUser();
    const authorization = await bearer(user);
    await user.destroy({ force: true });

    const res = await api()
      .get('/api/auth/check')
      .set('Authorization', authorization);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('UNAUTHENTICATED');
  });
});
