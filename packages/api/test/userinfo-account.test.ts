import { describe, expect, it } from 'vitest';
import { SendEmailCommand } from '@aws-sdk/client-ses';
import { api } from './helpers/request';
import { sesMock } from './helpers/aws';
import {
  bearer,
  createUser,
  DEFAULT_PASSWORD,
  type User,
} from './helpers/factories';
import { deletedAtOf, softDeleteUser } from './helpers/db';

/*
 * The account changes the web makes (`UserService`): the password change on
 * the account page (`updatePassword`), leaving the club (`deleteUserInfo`),
 * and the id and password reminders on the login page (`findId`,
 * `findPassword`), which mail the answer through SES.
 */

const NEW_PASSWORD = 'newpassword1';

function logIn(id: string, password: string) {
  return api().post('/api/auth/login').send({ id, password });
}

function changePassword(user: User, body: Record<string, unknown>) {
  return api()
    .patch('/api/userinfo/password')
    .set('Authorization', bearer(user))
    .send(body);
}

/** The mails sent so far, as the web's reader sees them. */
function sentMails() {
  return sesMock.commandCalls(SendEmailCommand).map((call) => {
    const input = call.args[0].input;
    return {
      to: input.Destination?.ToAddresses,
      from: input.Source,
      subject: input.Message?.Subject?.Data,
      text: input.Message?.Body?.Text?.Data,
    };
  });
}

function badRequest(message: string, code?: number) {
  return {
    success: false,
    error: 'BAD_REQUEST',
    message,
    ...(code === undefined ? {} : { code }),
  };
}

const notFound = (message = 'Not found') => ({
  success: false,
  error: 'NOT_FOUND',
  message,
});

describe('PATCH /api/userinfo/password', () => {
  it('changes the password when the current one is right', async () => {
    const user = await createUser();

    const response = await changePassword(user, {
      password: DEFAULT_PASSWORD,
      newPassword: NEW_PASSWORD,
      newPasswordCf: NEW_PASSWORD,
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect((await logIn(user.id, NEW_PASSWORD)).status).toBe(200);
    expect((await logIn(user.id, DEFAULT_PASSWORD)).status).toBe(401);
  });

  it.each([
    [
      'a wrong current password',
      { password: 'wrong', newPassword: NEW_PASSWORD },
      badRequest('Current password is incorrect', 1011),
    ],
    [
      'no new password',
      { password: DEFAULT_PASSWORD, newPassword: '', newPasswordCf: '' },
      badRequest('New password is required', 1012),
    ],
    [
      'a confirmation that does not match',
      {
        password: DEFAULT_PASSWORD,
        newPassword: NEW_PASSWORD,
        newPasswordCf: 'other',
      },
      badRequest('New password confirmation does not match', 1013),
    ],
    [
      'a new password shorter than 8',
      {
        password: DEFAULT_PASSWORD,
        newPassword: 'short12',
        newPasswordCf: 'short12',
      },
      badRequest('New password must be 8-20 characters', 1014),
    ],
    [
      'a new password longer than 20',
      {
        password: DEFAULT_PASSWORD,
        newPassword: 'a'.repeat(21),
        newPasswordCf: 'a'.repeat(21),
      },
      badRequest('New password must be 8-20 characters', 1014),
    ],
  ])(
    'refuses %s with the code the web reads, and keeps the password',
    async (_case, body, error) => {
      const user = await createUser();

      const response = await changePassword(user, body);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(error);
      expect((await logIn(user.id, DEFAULT_PASSWORD)).status).toBe(200);
    },
  );

  it('accepts new passwords of exactly 8 and 20 characters', async () => {
    for (const newPassword of ['a'.repeat(8), 'b'.repeat(20)]) {
      const user = await createUser();

      const response = await changePassword(user, {
        password: DEFAULT_PASSWORD,
        newPassword,
        newPasswordCf: newPassword,
      });

      expect(response.status).toBe(200);
      expect((await logIn(user.id, newPassword)).status).toBe(200);
    }
  });

  it('answers 404 to a member who left', async () => {
    const user = await createUser();
    await softDeleteUser(user);

    const response = await changePassword(user, {
      password: DEFAULT_PASSWORD,
      newPassword: NEW_PASSWORD,
      newPasswordCf: NEW_PASSWORD,
    });

    expect(response.status).toBe(404);
    expect(response.body).toEqual(notFound('id is not correct'));
  });
});

describe('PATCH /api/userinfo/password after the move', () => {
  it.each([
    ['no current password', { newPassword: NEW_PASSWORD }],
    ['a current password that is not text', { password: 1234 }],
  ])('refuses %s as a wrong password', async (_case, body) => {
    const user = await createUser();

    const response = await changePassword(user, {
      newPasswordCf: NEW_PASSWORD,
      ...body,
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      badRequest('Current password is incorrect', 1011),
    );
  });

  it('refuses a new password that is not text as missing', async () => {
    const user = await createUser();

    const response = await changePassword(user, {
      password: DEFAULT_PASSWORD,
      newPassword: 123456789,
      newPasswordCf: 123456789,
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(badRequest('New password is required', 1012));
    expect((await logIn(user.id, DEFAULT_PASSWORD)).status).toBe(200);
  });
});

describe('DELETE /api/userinfo', () => {
  it('marks the member as left, so they can no longer log in', async () => {
    const user = await createUser();
    const other = await createUser();

    const response = await api()
      .delete('/api/userinfo')
      .set('Authorization', bearer(user));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect(await deletedAtOf(user)).toBeInstanceOf(Date);
    expect(await deletedAtOf(other)).toBeNull();
    expect((await logIn(user.id, DEFAULT_PASSWORD)).status).toBe(401);
  });

  it('answers success again for a member who already left, keeping the date', async () => {
    const user = await createUser();
    await softDeleteUser(user);
    const leftAt = await deletedAtOf(user);

    const response = await api()
      .delete('/api/userinfo')
      .set('Authorization', bearer(user));

    expect(response.status).toBe(200);
    expect(await deletedAtOf(user)).toEqual(leftAt);
  });
});

describe('POST /api/userinfo/find/id', () => {
  it('mails every id with that name and email, without a token', async () => {
    const first = await createUser({
      username: '홍길동',
      email: 'hong@example.com',
    });
    const second = await createUser({
      username: '홍길동',
      email: 'hong@example.com',
    });
    await createUser({ username: '홍길동', email: 'other@example.com' });
    const left = await createUser({
      username: '홍길동',
      email: 'hong@example.com',
    });
    await softDeleteUser(left);

    const response = await api()
      .post('/api/userinfo/find/id')
      .send({ name: '홍길동', email: 'hong@example.com' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect(sentMails()).toEqual([
      {
        to: ['hong@example.com'],
        from: 'no-reply@snuaaa.net',
        subject: '[SNUAAA] 회원님의 ID를 알려드립니다.',
        text: `회원님의 ID는 ${first.id}, ${second.id}입니다.`,
      },
    ]);
  });

  it('answers 404 and mails nothing when no member matches', async () => {
    await createUser({ username: '홍길동', email: 'hong@example.com' });

    const response = await api()
      .post('/api/userinfo/find/id')
      .send({ name: '김철수', email: 'hong@example.com' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual(notFound());
    expect(sentMails()).toEqual([]);
  });

  it('answers 400 without an email', async () => {
    const response = await api()
      .post('/api/userinfo/find/id')
      .send({ name: '홍길동' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(badRequest('email can not be null'));
  });
});

describe('POST /api/userinfo/find/id after the move', () => {
  it('answers 400 without a name', async () => {
    await createUser({ username: '홍길동', email: 'hong@example.com' });

    const response = await api()
      .post('/api/userinfo/find/id')
      .send({ email: 'hong@example.com' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(badRequest('name can not be null'));
    expect(sentMails()).toEqual([]);
  });
});

describe('POST /api/userinfo/find/pw', () => {
  const TEMPORARY_PASSWORD =
    /^임시비밀번호는 ([0-9a-f]{10})입니다\.\n\s+로그인 하신 후 원하시는 비밀번호로 변경해주세요\.$/;

  it('mails a new temporary password, without a token', async () => {
    const user = await createUser({
      username: '홍길동',
      email: 'hong@example.com',
    });

    const response = await api()
      .post('/api/userinfo/find/pw')
      .send({ id: user.id, name: '홍길동', email: 'hong@example.com' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    const [mail] = sentMails();
    expect(mail).toEqual({
      to: ['hong@example.com'],
      from: 'no-reply@snuaaa.net',
      subject: '[SNUAAA] 회원님의 임시 비밀번호를 알려드립니다.',
      text: expect.stringMatching(TEMPORARY_PASSWORD),
    });
    const [, temporary] = TEMPORARY_PASSWORD.exec(mail.text ?? '') ?? [];
    expect((await logIn(user.id, temporary)).status).toBe(200);
    expect((await logIn(user.id, DEFAULT_PASSWORD)).status).toBe(401);
  });

  it.each([
    ['a different name', { name: '김철수', email: 'hong@example.com' }],
    ['a different email', { name: '홍길동', email: 'kim@example.com' }],
  ])('answers 404 to %s, and keeps the password', async (_case, body) => {
    const user = await createUser({
      username: '홍길동',
      email: 'hong@example.com',
    });

    const response = await api()
      .post('/api/userinfo/find/pw')
      .send({ id: user.id, ...body });

    expect(response.status).toBe(404);
    expect(response.body).toEqual(notFound());
    expect(sentMails()).toEqual([]);
    expect((await logIn(user.id, DEFAULT_PASSWORD)).status).toBe(200);
  });

  it('answers 404 to an unknown id or a member who left', async () => {
    const left = await createUser({
      username: '홍길동',
      email: 'hong@example.com',
    });
    await softDeleteUser(left);

    const responses = [
      await api()
        .post('/api/userinfo/find/pw')
        .send({ id: 'nobody', name: '홍길동', email: 'hong@example.com' }),
      await api()
        .post('/api/userinfo/find/pw')
        .send({ id: left.id, name: '홍길동', email: 'hong@example.com' }),
    ];

    expect(responses.map((response) => response.status)).toEqual([404, 404]);
    expect(responses.map((response) => response.body)).toEqual([
      notFound('id is not correct'),
      notFound('id is not correct'),
    ]);
    expect(sentMails()).toEqual([]);
  });

  it('answers 400 without an id', async () => {
    const response = await api()
      .post('/api/userinfo/find/pw')
      .send({ name: '홍길동', email: 'hong@example.com' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(badRequest('id can not be null'));
  });
});

describe('POST /api/userinfo/find/pw after the move', () => {
  it('keeps the old password when the mail fails', async () => {
    const user = await createUser({
      username: '홍길동',
      email: 'hong@example.com',
    });
    sesMock.on(SendEmailCommand).rejects(new Error('SES is down'));

    const response = await api()
      .post('/api/userinfo/find/pw')
      .send({ id: user.id, name: '홍길동', email: 'hong@example.com' });

    expect(response.status).toBe(500);
    expect((await logIn(user.id, DEFAULT_PASSWORD)).status).toBe(200);
  });
});
