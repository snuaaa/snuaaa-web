import { describe, expect, it } from 'vitest';
import type { Test } from 'supertest';
import ContentModel from '../../src/models/Content';
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

  // Every route that lists a board's contents checks lv_read.
  const BOARD_READ_ROUTES = [
    '/api/board/:board_id/posts',
    '/api/board/:board_id/tags',
    '/api/board/:board_id/exhibitions',
    '/api/photoboard/:board_id/albums',
  ];

  it.each(BOARD_READ_ROUTES)(
    'GET %s allows a grade within lv_read',
    async (route) => {
      const board = await createBoard({ lv_read: 8 });
      const member = await createUser({ grade: 8 });

      const res = await api()
        .get(route.replace(':board_id', board.get('board_id') as string))
        .set('Authorization', await bearer(member));

      expect(res.status).toBe(200);
    },
  );

  it.each(BOARD_READ_ROUTES)(
    'GET %s rejects a grade above lv_read with 403',
    async (route) => {
      const board = await createBoard({ lv_read: 6 });
      const member = await createUser({ grade: 8 });

      const res = await api()
        .get(route.replace(':board_id', board.get('board_id') as string))
        .set('Authorization', await bearer(member));

      expect(res.status).toBe(403);
      expect(res.body).toEqual(FORBIDDEN);
    },
  );

  it('GET /api/board/:board_id/posts returns 404 for an unknown board', async () => {
    const member = await createUser({ grade: 8 });

    const res = await api()
      .get('/api/board/b_missing/posts')
      .set('Authorization', await bearer(member));

    expect(res.status).toBe(404);
  });
});

describe('board write level (lv_write)', () => {
  async function setup() {
    const board = await createBoard({ lv_read: 9, lv_write: 6 });
    return { board, boardId: board.get('board_id') as string };
  }

  const countContents = async (boardId: string) =>
    ContentModel.count({ where: { board_id: boardId } });

  // Each request is what the web sends, minus anything the check runs before.
  const WRITE_REQUESTS: [string, (boardId: string) => Test][] = [
    [
      'POST /api/board/:board_id/post',
      (id) =>
        api()
          .post(`/api/board/${id}/post`)
          .send({ title: 'title', text: 'text' }),
    ],
    [
      'POST /api/board/:board_id/document',
      (id) =>
        api()
          .post(`/api/board/${id}/document`)
          .send({ title: 'title', text: 'text', generation: 30 }),
    ],
    [
      'POST /api/board/:board_id/exhibition',
      (id) =>
        api()
          .post(`/api/board/${id}/exhibition`)
          .attach('poster', Buffer.from('poster'), 'poster.jpg'),
    ],
    [
      'POST /api/photoboard/:board_id/album',
      (id) =>
        api()
          .post(`/api/photoboard/${id}/album`)
          .send({ title: 'album', text: 'text' }),
    ],
    [
      'POST /api/photo',
      (id) => api().post('/api/photo').send({ board_id: id, list: [] }),
    ],
    [
      'POST /api/exhibition/:exhibition_id/exhibitPhoto',
      (id) =>
        api()
          .post('/api/exhibition/1/exhibitPhoto')
          .field('board_id', id)
          .field('photoInfo', '{}')
          .attach('exhibitPhoto', Buffer.from('photo'), 'photo.jpg'),
    ],
  ];

  it.each(WRITE_REQUESTS)(
    '%s rejects a grade above lv_write with 403',
    async (_route, request) => {
      const { boardId } = await setup();
      const member = await createUser({ grade: 8 });

      const res = await request(boardId).set(
        'Authorization',
        await bearer(member),
      );

      expect(res.status).toBe(403);
      expect(res.body).toEqual(FORBIDDEN);
      expect(await countContents(boardId)).toBe(0);
    },
  );

  it.each([
    ['POST /api/board/:board_id/post', 'PO'],
    ['POST /api/board/:board_id/document', 'DO'],
    ['POST /api/photoboard/:board_id/album', 'AL'],
  ])('%s allows a grade within lv_write', async (route, type) => {
    const { boardId } = await setup();
    const staff = await createUser({ grade: 6 });
    const request = WRITE_REQUESTS.find(([r]) => r === route)![1];

    const res = await request(boardId).set(
      'Authorization',
      await bearer(staff),
    );

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true });
    expect(
      await ContentModel.count({ where: { board_id: boardId, type } }),
    ).toBe(1);
  });

  it('POST /api/photo rejects a request without board_id with 400', async () => {
    const member = await createUser({ grade: 8 });

    const res = await api()
      .post('/api/photo')
      .set('Authorization', await bearer(member))
      .send({ list: [] });

    expect(res.status).toBe(400);
  });
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
