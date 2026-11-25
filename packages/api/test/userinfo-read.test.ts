import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import { bearer, createUser, type User } from './helpers/factories';
import { softDeleteUser } from './helpers/db';

/*
 * The member reads the web makes (`UserService`): one's own info and
 * another member's page (`retrieveUserInfo`), the member list for staff
 * (`retrieveUsers`, sorted and paged) and the name search when tagging a
 * photographer (`searchMini`).
 */

function get(user: User, path: string, query: Record<string, string> = {}) {
  return api()
    .get(`/api/userinfo${path}`)
    .query(query)
    .set('Authorization', bearer(user));
}

const uuids = (rows: { user_uuid: string }[]) =>
  rows.map((row) => row.user_uuid);

describe('GET /api/userinfo', () => {
  it("answers the member's own info, with their contact details", async () => {
    const user = await createUser({ grade: 8, nickname: '홍길동' });

    const response = await get(user, '');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      userInfo: {
        user_id: user.user_id,
        id: user.id,
        username: expect.any(String),
        nickname: '홍길동',
        aaa_no: null,
        user_uuid: user.user_uuid,
        col_no: null,
        major: null,
        email: expect.stringContaining('@example.com'),
        mobile: '010-0000-0000',
        introduction: null,
        grade: 8,
        level: 0,
        profile_path: null,
        profile_url: null,
        login_at: null,
      },
    });
  });

  it('answers 404 for a member who left', async () => {
    const user = await createUser();
    await softDeleteUser(user);

    const response = await get(user, '');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      error: 'NOT_FOUND',
      message: 'id is not correct',
    });
  });
});

describe('GET /api/userinfo/:user_uuid', () => {
  it("answers another member's profile, without their contact details", async () => {
    const member = await createUser({ grade: 8, nickname: '홍길동' });

    const response = await get(await createUser(), `/${member.user_uuid}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      userInfo: {
        user_id: member.user_id,
        id: member.id,
        username: expect.any(String),
        nickname: '홍길동',
        aaa_no: null,
        col_no: null,
        major: null,
        introduction: null,
        grade: 8,
        level: 0,
        profile_path: null,
        profile_url: null,
      },
    });
  });

  it('answers null for an unknown member or one who left', async () => {
    const leaver = await createUser();
    await softDeleteUser(leaver);
    const reader = await createUser();

    const responses = [
      await get(reader, `/${leaver.user_uuid}`),
      await get(reader, '/00000000-0000-4000-8000-000000000000'),
    ];

    expect(responses.map((response) => response.body)).toEqual([
      { success: true, userInfo: null },
      { success: true, userInfo: null },
    ]);
  });
});

describe('GET /api/userinfo/all', () => {
  it('lists the members for staff, newest first, 20 a page, with how many there are', async () => {
    const staff = await createUser({ grade: 6 });
    const members: User[] = [];
    for (let n = 0; n < 21; n += 1) {
      members.push(await createUser());
    }
    const leaver = await createUser();
    await softDeleteUser(leaver);

    const response = await get(staff, '/all');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(22);
    expect(uuids(response.body.userInfo)).toEqual(
      uuids(members.slice(1).reverse()),
    );
    expect(response.body.userInfo[0]).toEqual({
      user_uuid: members[20].user_uuid,
      id: members[20].id,
      username: expect.any(String),
      nickname: members[20].nickname,
      aaa_no: null,
      grade: 9,
      level: 0,
      login_at: null,
      created_at: expect.any(String),
    });
  });

  it('sorts by the column and order the web asks for, and pages with limit and offset', async () => {
    const staff = await createUser({ grade: 6, nickname: 'b' });
    const first = await createUser({ nickname: 'a' });
    const last = await createUser({ nickname: 'c' });

    const ascending = await get(staff, '/all', {
      sort: 'nickname',
      order: 'ASC',
    });
    const paged = await get(staff, '/all', {
      sort: 'nickname',
      order: 'DESC',
      limit: '1',
      offset: '1',
    });
    const empty = await get(staff, '/all', { sort: '', order: '' });

    expect(uuids(ascending.body.userInfo)).toEqual([
      first.user_uuid,
      staff.user_uuid,
      last.user_uuid,
    ]);
    expect(paged.body).toEqual({
      success: true,
      userInfo: [expect.objectContaining({ user_uuid: staff.user_uuid })],
      count: 3,
    });
    expect(uuids(empty.body.userInfo)).toEqual([
      last.user_uuid,
      first.user_uuid,
      staff.user_uuid,
    ]);
  });

  it('refuses a member below staff', async () => {
    const response = await get(await createUser({ grade: 7 }), '/all');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      success: false,
      error: 'FORBIDDEN',
      message: 'Permission denied',
    });
  });
});

describe('GET /api/userinfo/search/mini', () => {
  it('finds up to 5 members whose name contains the text', async () => {
    const matches: User[] = [];
    for (let n = 0; n < 6; n += 1) {
      matches.push(await createUser());
    }
    const leaver = await createUser();
    await softDeleteUser(leaver);

    const response = await get(matches[0], '/search/mini', { name: 'User' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.userList).toHaveLength(5);
    expect(response.body.userList[0]).toEqual({
      user_uuid: matches[0].user_uuid,
      username: expect.stringContaining('User'),
      nickname: matches[0].nickname,
      profile_path: null,
    });
    expect(uuids(response.body.userList)).not.toContain(leaver.user_uuid);
  });

  it('answers 400 without a name', async () => {
    const response = await get(await createUser(), '/search/mini');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: 'BAD_REQUEST',
      message: 'name is required',
    });
  });
});

describe('member reads after the move', () => {
  it('falls back to the default order and page for a sort column or limit it does not know', async () => {
    const staff = await createUser({ grade: 6 });
    const member = await createUser();

    const responses = [
      await get(staff, '/all', { sort: 'password' }),
      await get(staff, '/all', { sort: 'nope', limit: 'abc', offset: 'x' }),
    ];

    for (const response of responses) {
      expect(response.status).toBe(200);
      expect(uuids(response.body.userInfo)).toEqual([
        member.user_uuid,
        staff.user_uuid,
      ]);
    }
  });

  it('answers null for a malformed member uuid', async () => {
    const response = await get(await createUser(), '/nope');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, userInfo: null });
  });

  it('no longer serves the old profile edit the web stopped calling', async () => {
    const response = await api()
      .patch('/api/userinfo')
      .set('Authorization', bearer(await createUser()))
      .send({ username: 'x' });

    expect(response.status).toBe(404);
  });
});
