import { PutObjectCommand } from '@aws-sdk/client-s3';
import jwt from 'jsonwebtoken';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import { s3Mock, s3UploadKeys } from './helpers/aws';
import {
  deleteUser,
  loginHistoryOf,
  softDeleteUser,
  usersWithLoginId,
} from './helpers/db';
import { bearer, createUser, DEFAULT_PASSWORD } from './helpers/factories';
import { jpegImage } from './helpers/files';

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
      user_id: user.user_id,
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
      .set('Authorization', bearer(user));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.userInfo).toMatchObject({
      user_id: user.user_id,
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
    const authorization = bearer(user);
    await deleteUser(user);

    const res = await api()
      .get('/api/auth/check')
      .set('Authorization', authorization);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('UNAUTHENTICATED');
  });
});

const HOUR = 60 * 60 * 1000;

/** The payload of a token the API signed, with how long it lasts. */
function payloadOf(token: string) {
  const { iat, exp, ...payload } = jwt.decode(token) as Record<string, number>;
  return { ...payload, lifetime: exp - iat };
}

const ONE_DAY = 24 * 60 * 60;

describe('POST /api/auth/login, in detail', () => {
  it('answers the fields the web keeps, the last login before this one, and sets the cookie', async () => {
    const user = await createUser({
      id: 'aaa',
      grade: 8,
      username: '홍길동',
      email: 'hong@example.com',
    });

    // The web posts to `auth/login/`, with a trailing slash.
    const response = await api()
      .post('/api/auth/login/')
      .send({ id: 'aaa', password: DEFAULT_PASSWORD, autoLogin: false });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      sucess: true,
      userInfo: {
        user_id: user.user_id,
        user_uuid: user.user_uuid,
        id: 'aaa',
        username: '홍길동',
        nickname: user.nickname,
        grade: 8,
        level: 0,
        email: 'hong@example.com',
        profile_path: null,
        login_at: null,
      },
      autoLogin: false,
      token: expect.any(String),
    });
    expect(payloadOf(response.body.token)).toEqual({
      _id: user.user_id,
      grade: 8,
      level: 0,
      autoLogin: false,
      lifetime: ONE_DAY,
    });
    expect(response.headers['set-cookie']).toEqual([
      `token=${response.body.token}; Path=/`,
    ]);
  });

  it('signs a 14-day token when the member asks to stay logged in', async () => {
    await createUser({ id: 'aaa' });

    const response = await api()
      .post('/api/auth/login')
      .send({ id: 'aaa', password: DEFAULT_PASSWORD, autoLogin: true });

    expect(response.body.autoLogin).toBe(true);
    expect(payloadOf(response.body.token)).toEqual(
      expect.objectContaining({ autoLogin: true, lifetime: 14 * ONE_DAY }),
    );
  });

  it('refuses a member who left', async () => {
    const user = await createUser({ id: 'aaa' });
    await softDeleteUser(user);

    const response = await api()
      .post('/api/auth/login')
      .send({ id: 'aaa', password: DEFAULT_PASSWORD });

    expect(response.status).toBe(401);
  });

  it('records a login at most once an hour, without touching updated_at', async () => {
    const first = await createUser();
    const recent = await createUser({
      login_at: new Date(Date.now() - HOUR / 2),
    });
    const earlier = await createUser({
      login_at: new Date(Date.now() - 2 * HOUR),
    });
    const before = await Promise.all(
      [first, recent, earlier].map(loginHistoryOf),
    );

    for (const user of [first, recent, earlier]) {
      const response = await api()
        .post('/api/auth/login')
        .send({ id: user.id, password: DEFAULT_PASSWORD });
      expect(response.status).toBe(200);
    }

    const [firstAfter, recentAfter, earlierAfter] = await Promise.all(
      [first, recent, earlier].map(loginHistoryOf),
    );
    const justNow = (date: Date | null) =>
      Math.abs(Date.now() - (date?.getTime() ?? 0)) < 10_000;
    expect(firstAfter.stats).toHaveLength(1);
    expect([firstAfter.login_at, ...firstAfter.stats].every(justNow)).toBe(
      true,
    );
    expect(firstAfter.updated_at).toEqual(before[0].updated_at);
    expect(recentAfter).toEqual(before[1]);
    expect(earlierAfter.stats).toHaveLength(1);
    expect([earlierAfter.login_at, ...earlierAfter.stats].every(justNow)).toBe(
      true,
    );
    expect(earlierAfter.updated_at).toEqual(before[2].updated_at);
  });
});

describe('POST /api/auth/login after the move', () => {
  it('signs a member without a grade as a new member, not as staff', async () => {
    await createUser({ id: 'aaa', grade: null as unknown as number });

    const response = await api()
      .post('/api/auth/login')
      .send({ id: 'aaa', password: DEFAULT_PASSWORD });

    expect(response.status).toBe(200);
    expect(payloadOf(response.body.token)).toEqual(
      expect.objectContaining({ grade: 9 }),
    );
  });
});

describe('GET /api/auth/check, in detail', () => {
  it("answers the member's info and a token with the grade now in the database", async () => {
    const user = await createUser({
      grade: 5,
      username: '홍길동',
      email: 'hong@example.com',
      aaa_no: '23AAA-12',
    });
    const loginAt = new Date(Date.now() - HOUR / 2);
    const recent = await createUser({ login_at: loginAt });

    const response = await api()
      .get('/api/auth/check')
      .set('Authorization', bearer({ ...user, grade: 9 }, { autoLogin: true }));
    const recentResponse = await api()
      .get('/api/auth/check')
      .set('Authorization', bearer(recent));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      userInfo: {
        user_id: user.user_id,
        id: user.id,
        username: '홍길동',
        nickname: user.nickname,
        aaa_no: '23AAA-12',
        user_uuid: user.user_uuid,
        col_no: null,
        major: null,
        email: 'hong@example.com',
        mobile: '010-0000-0000',
        introduction: null,
        grade: 5,
        level: 0,
        profile_path: null,
        profile_url: null,
        login_at: null,
      },
      autoLogin: true,
      token: expect.any(String),
    });
    expect(payloadOf(response.body.token)).toEqual({
      _id: user.user_id,
      grade: 5,
      level: 0,
      autoLogin: true,
      lifetime: 14 * ONE_DAY,
    });
    expect((await loginHistoryOf(user)).stats).toHaveLength(1);
    expect(recentResponse.body.userInfo.login_at).toBe(loginAt.toISOString());
    expect((await loginHistoryOf(recent)).stats).toHaveLength(0);
  });

  it('answers a guest with a new guest token', async () => {
    const response = await api()
      .get('/api/auth/check')
      .set('Authorization', bearer({ user_id: -1, grade: 10, level: 0 }));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      userInfo: {
        user_id: -1,
        grade: 10,
        level: 0,
        profile_path: null,
        nickname: 'guest',
      },
      autoLogin: false,
      token: expect.any(String),
    });
    expect(payloadOf(response.body.token)).toEqual({
      _id: -1,
      grade: 10,
      level: 0,
      autoLogin: false,
      lifetime: ONE_DAY,
    });
  });

  it('rejects the token of a member who left', async () => {
    const user = await createUser();
    await softDeleteUser(user);

    const response = await api()
      .get('/api/auth/check')
      .set('Authorization', bearer(user));

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token is not valid.');
  });
});

describe('GET /api/auth/login/guest', () => {
  it('answers a guest token and sets the cookie', async () => {
    const response = await api().get('/api/auth/login/guest');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      sucess: true,
      userInfo: {
        user_id: -1,
        grade: 10,
        level: 0,
        profile_path: null,
        nickname: 'guest',
      },
      autoLogin: false,
      token: expect.any(String),
    });
    expect(payloadOf(response.body.token)).toEqual(
      expect.objectContaining({ _id: -1, grade: 10, autoLogin: false }),
    );
    expect(response.headers['set-cookie']).toEqual([
      `token=${response.body.token}; Path=/`,
    ]);
  });
});

/** The form the web's signup page sends, every field as text. */
const signupForm = (overrides: Record<string, string> = {}) => ({
  id: 'newbie',
  password: 'secret12',
  passwordCf: 'secret12',
  username: '홍길동',
  email: 'hong@example.com',
  mobile: '010-1234-5678',
  schoolNum: '23',
  major: '물리천문학부',
  aaaNum: '23AAA-12',
  introduction: '안녕하세요',
  ...overrides,
});

function signUp(
  fields: Record<string, string>,
  profile?: { image: Buffer; contentType?: string },
) {
  // The web posts to `auth/signup/`, with a trailing slash.
  const request = api().post('/api/auth/signup/');
  for (const [key, value] of Object.entries(fields)) {
    request.field(key, value);
  }
  if (profile) {
    request.attach('profile', profile.image, {
      filename: 'me.jpg',
      contentType: profile.contentType ?? 'image/jpeg',
    });
  }
  return request;
}

const badRequest = (message: string) => ({
  success: false,
  error: 'BAD_REQUEST',
  message,
});

describe('POST /api/auth/signup', () => {
  it('creates a member (grade 8 with a club number) who can then log in', async () => {
    const response = await signUp(signupForm());

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect(await usersWithLoginId('newbie')).toEqual([
      {
        user_id: expect.any(Number),
        user_uuid: expect.stringMatching(/^[0-9a-f-]{36}$/),
        id: 'newbie',
        username: '홍길동',
        nickname: '23홍길동',
        aaa_no: '23AAA-12',
        col_no: '23',
        major: '물리천문학부',
        email: 'hong@example.com',
        mobile: '010-1234-5678',
        introduction: '안녕하세요',
        grade: 8,
        level: 0,
        profile_path: null,
        profile_url: null,
        login_at: null,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        deleted_at: null,
        has_password: true,
      },
    ]);
    const login = await api()
      .post('/api/auth/login')
      .send({ id: 'newbie', password: 'secret12' });
    expect(login.status).toBe(200);
  });

  it.each([
    ['AAA23-12', '23홍길동', 'AAA23-12', 8],
    ['not a number', '홍길동', null, 9],
    ['', '홍길동', null, 9],
  ])(
    'reads the club number %j as nickname %s',
    async (aaaNum, nickname, aaaNo, grade) => {
      const response = await signUp(signupForm({ aaaNum }));

      expect(response.status).toBe(200);
      expect(await usersWithLoginId('newbie')).toEqual([
        expect.objectContaining({ nickname, aaa_no: aaaNo, grade }),
      ]);
    },
  );

  it('keeps empty optional fields as empty text', async () => {
    const response = await signUp(
      signupForm({ schoolNum: '', major: '', mobile: '', introduction: '' }),
    );

    expect(response.status).toBe(200);
    expect(await usersWithLoginId('newbie')).toEqual([
      expect.objectContaining({
        col_no: '',
        major: '',
        mobile: '',
        introduction: '',
      }),
    ]);
  });

  it('uploads the profile photo, 300px on its short side, and keeps its URL', async () => {
    const response = await signUp(signupForm(), {
      image: await jpegImage(400, 600),
    });

    expect(response.status).toBe(200);
    const [key] = s3UploadKeys();
    expect(key).toMatch(/^image\/profile\/\d{8}\/[0-9a-f-]{36}$/);
    const [uploaded] = s3Mock.commandCalls(PutObjectCommand);
    expect(
      await sharp(uploaded.args[0].input.Body as Buffer).metadata(),
    ).toEqual(expect.objectContaining({ width: 300, height: 450 }));
    const url = `https://snuaaa-test.s3.ap-northeast-2.amazonaws.com/${key}`;
    expect(await usersWithLoginId('newbie')).toEqual([
      expect.objectContaining({ profile_path: url, profile_url: url }),
    ]);
  });

  it.each([
    ['an id with other characters', { id: 'new-bie' }, 'BAD USERNAME'],
    ['no id', { id: '' }, 'BAD USERNAME'],
    [
      'a password shorter than 4',
      { password: 'abc', passwordCf: 'abc' },
      'BAD PASSWORD',
    ],
    [
      'a confirmation that does not match',
      { passwordCf: 'other' },
      'BAD PASSWORD CONFIRM',
    ],
  ])('refuses %s with 400', async (_case, overrides, message) => {
    const form = signupForm(overrides);
    const response = await signUp(form);

    expect(response.status).toBe(400);
    expect(response.body).toEqual(badRequest(message));
    expect(await usersWithLoginId(form.id)).toEqual([]);
  });

  it('refuses an id a member has with 409, but not the id of one who left', async () => {
    await createUser({ id: 'taken' });
    const left = await createUser({ id: 'newbie' });
    await softDeleteUser(left);

    const taken = await signUp(signupForm({ id: 'taken' }));
    const reused = await signUp(signupForm());

    expect(taken.status).toBe(409);
    expect(taken.body).toEqual({
      success: false,
      error: 'CONFLICT',
      message: 'id is duplicated',
    });
    expect(reused.status).toBe(200);
  });
});

describe('POST /api/auth/signup after the move', () => {
  it('refuses a profile photo that is not an image with 400', async () => {
    const response = await signUp(signupForm(), {
      image: Buffer.from('not an image'),
      contentType: 'text/plain',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(badRequest('Image is not valid'));
    expect(s3UploadKeys()).toEqual([]);
    expect(await usersWithLoginId('newbie')).toEqual([]);
  });

  it.each([
    ['an id longer than 16', { id: 'a'.repeat(17) }],
    ['a name too long for the nickname', { username: '가'.repeat(15) }],
    ['a major longer than 32', { major: '가'.repeat(33) }],
    ['a school number longer than 8', { schoolNum: '1'.repeat(9) }],
  ])('refuses %s with 400 instead of 500', async (_case, overrides) => {
    const response = await signUp(signupForm(overrides));

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('BAD_REQUEST');
  });
});

describe('POST /api/auth/signup/dupcheck', () => {
  it('answers whether the id is free', async () => {
    await createUser({ id: 'taken' });

    const free = await api()
      .post('/api/auth/signup/dupcheck')
      .send({ check_id: 'free' });
    const taken = await api()
      .post('/api/auth/signup/dupcheck')
      .send({ check_id: 'taken' });
    const missing = await api().post('/api/auth/signup/dupcheck').send({});

    expect(free.status).toBe(200);
    expect(free.body).toEqual({ success: true });
    expect(taken.status).toBe(409);
    expect(taken.body).toEqual({
      success: false,
      error: 'CONFLICT',
      message: 'id is duplicated',
    });
    expect(missing.status).toBe(400);
    expect(missing.body).toEqual(badRequest('id can not be null'));
  });
});
