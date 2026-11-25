import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import { bearer, createUser, type User } from './helpers/factories';
import {
  gradeOf,
  profileOf,
  softDeleteUser,
  withRowsLocked,
} from './helpers/db';

/*
 * The member's own profile edit (`UserService.updateMyUserInfo`, the body of
 * `UpdateUserInfoRequest`) and the grade change on the member list
 * (`UserService.updateUserGrade`).
 */

const PROFILE = {
  username: '홍길동',
  aaa_no: '23AAA-12',
  email: 'hong@example.com',
  mobile: '010-1234-5678',
  major: 'Physics',
  col_no: '23',
  profile_url: 'https://bucket.example.com/profile.jpg',
  profile_path: '/profile/old.jpg',
  introduction: 'Hello',
};

function edit(user: User, body: Record<string, unknown>) {
  return api().patch('/api/user').set('Authorization', bearer(user)).send(body);
}

describe('PATCH /api/user', () => {
  it('saves the profile, with the generation from the club number in the nickname', async () => {
    const user = await createUser({ grade: 8 });

    const response = await edit(user, PROFILE);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect(await profileOf(user)).toEqual({
      username: '홍길동',
      nickname: '23홍길동',
      aaa_no: '23AAA-12',
      col_no: '23',
      major: 'Physics',
      email: 'hong@example.com',
      mobile: '010-1234-5678',
      introduction: 'Hello',
      grade: 8,
      level: 0,
      profile_path: '/profile/old.jpg',
      profile_url: 'https://bucket.example.com/profile.jpg',
    });
  });

  it.each([
    ['AAA23-1', '23홍길동'],
    ['hello', '홍길동'],
    ['', '홍길동'],
  ])(
    'reads the club number %j into the nickname %j',
    async (aaaNo, nickname) => {
      const user = await createUser({ grade: 8 });

      await edit(user, { ...PROFILE, aaa_no: aaaNo });

      expect(await profileOf(user)).toMatchObject({ aaa_no: aaaNo, nickname });
    },
  );

  it.each([
    ['a new member with a club number', 9, '23AAA-12', 8],
    // The web checks the club number's format before it sends it.
    ['a new member with any club number', 9, 'hello', 8],
    ['a new member without a club number', 9, '', 9],
    ['a member without a club number', 8, '', 8],
    ['staff', 6, '', 6],
  ])('sets the grade of %s', async (_case, grade, aaaNo, expected) => {
    const user = await createUser({ grade });

    await edit(user, { ...PROFILE, aaa_no: aaaNo });

    expect(await gradeOf(user)).toBe(expected);
  });

  it('leaves out the fields the body leaves out, and clears the ones it sends as null', async () => {
    const user = await createUser({ grade: 9 });
    const before = await profileOf(user);

    await edit(user, { introduction: 'Only this', profile_url: null });

    expect(await profileOf(user)).toEqual({
      ...before,
      introduction: 'Only this',
      profile_url: null,
    });
  });

  it('takes a number as the college number', async () => {
    const user = await createUser();

    await edit(user, { ...PROFILE, col_no: 23 });

    expect((await profileOf(user)).col_no).toBe('23');
  });

  it('answers 404 for a member who left', async () => {
    const user = await createUser();
    await softDeleteUser(user);

    const response = await edit(user, PROFILE);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      error: 'NOT_FOUND',
      message: 'id is not correct',
    });
  });
});

describe('PATCH /api/user/:user_uuid/grade', () => {
  const change = (actor: User, uuid: string, body: Record<string, unknown>) =>
    api()
      .patch(`/api/user/${uuid}/grade`)
      .set('Authorization', bearer(actor))
      .send(body);

  it('takes the grade as a string too', async () => {
    const manager = await createUser({ grade: 1 });
    const member = await createUser({ grade: 9 });

    const response = await change(manager, member.user_uuid, { grade: '8' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect(await gradeOf(member)).toBe(8);
  });

  it('answers 400 without a grade and 404 for an unknown member', async () => {
    const manager = await createUser({ grade: 1 });
    const member = await createUser({ grade: 9 });
    const leaver = await createUser({ grade: 9 });
    await softDeleteUser(leaver);

    const responses = [
      await change(manager, member.user_uuid, {}),
      await change(manager, '00000000-0000-4000-8000-000000000000', {
        grade: 8,
      }),
      await change(manager, leaver.user_uuid, { grade: 8 }),
    ];

    expect(responses.map((response) => response.body)).toEqual([
      { success: false, error: 'BAD_REQUEST', message: 'grade is not valid' },
      { success: false, error: 'NOT_FOUND', message: 'user not found' },
      { success: false, error: 'NOT_FOUND', message: 'user not found' },
    ]);
  });
});

describe('member edits after the move', () => {
  it('answers 400 for a field longer than its column, and saves nothing', async () => {
    const user = await createUser();
    const before = await profileOf(user);

    const responses = [
      await edit(user, { ...PROFILE, username: 'x'.repeat(17) }),
      await edit(user, { ...PROFILE, email: `${'x'.repeat(60)}@example.com` }),
      // The generation makes the nickname 2 characters longer.
      await edit(user, { ...PROFILE, username: 'x'.repeat(15) }),
    ];

    expect(responses.map((response) => response.status)).toEqual([
      400, 400, 400,
    ]);
    expect(responses.map((response) => response.body.error)).toEqual([
      'BAD_REQUEST',
      'BAD_REQUEST',
      'BAD_REQUEST',
    ]);
    expect(await profileOf(user)).toEqual(before);
  });

  it('keeps the nickname when the body has no name', async () => {
    const user = await createUser({ grade: 9 });

    await edit(user, { aaa_no: '23AAA-12' });

    expect(await profileOf(user)).toMatchObject({
      nickname: user.nickname,
      aaa_no: '23AAA-12',
    });
  });

  it('answers 404 for a malformed member uuid', async () => {
    const response = await api()
      .patch('/api/user/nope/grade')
      .set('Authorization', bearer(await createUser({ grade: 1 })))
      .send({ grade: 8 });

    expect(response.status).toBe(404);
  });

  it('no longer serves the profile photo migration', async () => {
    const response = await api()
      .post('/api/user/migrate')
      .set('Authorization', bearer(await createUser({ grade: 1 })));

    expect(response.status).toBe(404);
  });
});

describe('PATCH /api/user/:user_uuid/grade after the move', () => {
  it("waits for a change to the manager's own grade before deciding", async () => {
    const manager = await createUser({ grade: 3 });
    const member = await createUser({ grade: 9 });

    // Another request holds the manager's row, e.g. while demoting them.
    const response = await withRowsLocked(
      'tb_user',
      { user_id: manager.user_id },
      () =>
        api()
          .patch(`/api/user/${member.user_uuid}/grade`)
          .set('Authorization', bearer(manager))
          .send({ grade: 8 }),
    );

    // The lock timeout ends the wait; nothing was changed.
    expect(response.status).toBe(500);
    expect(await gradeOf(member)).toBe(9);
  });
});
