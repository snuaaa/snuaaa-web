import { describe, expect, it } from 'vitest';
import UserModel from '../../src/models/User';
import { api } from '../helpers/request';
import {
  bearer,
  createBoard,
  createPost,
  createUser,
} from '../helpers/factories';

// Lower grade = more privilege. 8/9 are regular members.

const FORBIDDEN = {
  success: false,
  error: 'FORBIDDEN',
  message: 'Permission denied',
  code: 4001,
};

describe('board read level (lv_read)', () => {
  it('GET /api/board/:board_id allows a grade within lv_read', async () => {
    await createBoard({ board_id: 'b_member', lv_read: 8 });
    const member = await createUser({ grade: 8 });

    const res = await api()
      .get('/api/board/b_member')
      .set('Authorization', await bearer(member));

    expect(res.status).toBe(200);
    expect(res.body.boardInfo).toMatchObject({ board_id: 'b_member' });
  });

  it('GET /api/board/:board_id rejects a grade above lv_read with 403', async () => {
    await createBoard({ board_id: 'b_staff', lv_read: 6 });
    const member = await createUser({ grade: 8 });

    const res = await api()
      .get('/api/board/b_staff')
      .set('Authorization', await bearer(member));

    expect(res.status).toBe(403);
    expect(res.body).toEqual(FORBIDDEN);
  });

  it('GET /api/post/:post_id rejects a grade above the board lv_read with 403', async () => {
    const board = await createBoard({ lv_read: 6 });
    const staff = await createUser({ grade: 6 });
    const postId = await createPost(staff, board);
    const member = await createUser({ grade: 8 });

    const res = await api()
      .get(`/api/post/${postId}`)
      .set('Authorization', await bearer(member));

    expect(res.status).toBe(403);
    expect(res.body).toEqual(FORBIDDEN);
  });

  it('GET /api/post/:post_id returns the post within lv_read', async () => {
    const board = await createBoard({ lv_read: 8 });
    const author = await createUser({ grade: 8 });
    const postId = await createPost(author, board, { title: 'hello' });

    const res = await api()
      .get(`/api/post/${postId}`)
      .set('Authorization', await bearer(author));

    expect(res.status).toBe(200);
    expect(res.body.postInfo).toMatchObject({
      content_id: postId,
      title: 'hello',
    });
  });

  // Not enforced yet. Turn these into tests when the checks are added.
  it.todo('GET /api/board/:board_id/posts rejects a grade above lv_read');
  it.todo('POST /api/board/:board_id/post rejects a grade above lv_write');
});

describe('editing a post (author or board lv_edit)', () => {
  async function setup() {
    const board = await createBoard({ lv_read: 9, lv_write: 9, lv_edit: 3 });
    const author = await createUser({ grade: 8 });
    const postId = await createPost(author, board);
    return { postId, author };
  }

  it.each([
    ['PATCH', 'the author', 8, true],
    ['PATCH', 'another member', 8, false],
    ['PATCH', 'a grade within lv_edit', 3, false],
    ['DELETE', 'the author', 8, true],
    ['DELETE', 'another member', 8, false],
    ['DELETE', 'a grade within lv_edit', 3, false],
  ])('%s by %s', async (method, _who, grade, isAuthor) => {
    const { postId, author } = await setup();
    const actor = isAuthor ? author : await createUser({ grade });
    const allowed = isAuthor || grade <= 3;

    const req =
      method === 'PATCH'
        ? api().patch(`/api/post/${postId}`).send({ title: 'edited' })
        : api().delete(`/api/post/${postId}`);
    const res = await req.set('Authorization', await bearer(actor));

    if (allowed) {
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
    } else {
      expect(res.status).toBe(403);
      expect(res.body).toEqual(FORBIDDEN);
    }
  });

  it('returns 404 for a post that does not exist', async () => {
    const user = await createUser();

    const res = await api()
      .delete('/api/post/999999')
      .set('Authorization', await bearer(user));

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      error: 'NOT_FOUND',
      message: 'Content not found',
    });
  });
});

describe('PATCH /api/user/:user_uuid/grade', () => {
  const change = async (actor: UserModel, target: UserModel, grade: number) =>
    api()
      .patch(`/api/user/${target.get('user_uuid')}/grade`)
      .set('Authorization', await bearer(actor))
      .send({ grade });

  it('lets grade 1-3 lower a member below their own grade', async () => {
    const manager = await createUser({ grade: 3 });
    const member = await createUser({ grade: 9 });

    const res = await change(manager, member, 8);

    expect(res.status).toBe(200);
    await member.reload();
    expect(member.get('grade')).toBe(8);
  });

  it.each([
    ['a regular member', 8, 9, 9],
    ['a manager, on a member of the same grade', 3, 3, 9],
    ['a manager, to a grade at or above their own', 3, 9, 3],
  ])('rejects %s with 403', async (_case, actorGrade, targetGrade, grade) => {
    const actor = await createUser({ grade: actorGrade });
    const target = await createUser({ grade: targetGrade });

    const res = await change(actor, target, grade);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('FORBIDDEN');
    await target.reload();
    expect(target.get('grade')).toBe(targetGrade);
  });

  it('rejects a grade that does not exist with 400', async () => {
    const manager = await createUser({ grade: 1 });
    const member = await createUser({ grade: 9 });

    const res = await change(manager, member, 2);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('BAD_REQUEST');
  });
});

describe('equipment admin endpoints', () => {
  it.each([
    ['POST /api/equipment', 'post', '/api/equipment'],
    ['POST /api/equipment/category', 'post', '/api/equipment/category'],
    ['DELETE /api/equipment/:id', 'delete', '/api/equipment/1'],
  ] as const)('%s rejects grade 7 with 403', async (_e, method, url) => {
    const member = await createUser({ grade: 7 });

    const authorization = await bearer(member);
    const res = await api()[method](url).set('Authorization', authorization);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      success: false,
      error: 'FORBIDDEN',
      message: 'PERMISSION DENIED',
    });
  });

  // Any logged-in member can start these S3 migrations today.
  it.todo('POST /api/*/migrate endpoints are limited to admins');
});
