import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import {
  bearer,
  createBoard,
  createComment,
  createCommentLike,
  createContent,
  createUser,
} from './helpers/factories';
import {
  commentState,
  contentCounters,
  countComments,
  hasCommentLike,
  withFailingWrites,
} from './helpers/db';

const FORBIDDEN = {
  success: false,
  error: 'FORBIDDEN',
  message: 'Permission denied',
  code: 4001,
};

async function setup() {
  const board = await createBoard({ lv_read: 10, lv_write: 10, lv_edit: 1 });
  const author = await createUser({ grade: 8 });
  const contentId = await createContent(author, board, { comment_num: 1 });
  return { board, author, contentId };
}

describe('POST /api/content/:content_id/comment', () => {
  it('adds the comment and counts it on the content', async () => {
    const { contentId } = await setup();
    const user = await createUser({ grade: 8 });

    const res = await api()
      .post(`/api/content/${contentId}/comment`)
      .set('Authorization', bearer(user))
      .send({ text: 'hello' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(await countComments(contentId)).toBe(1);
    expect((await contentCounters(contentId)).comment_num).toBe(2);
  });

  it('keeps neither the comment nor the count when the count fails', async () => {
    const { contentId } = await setup();
    const user = await createUser({ grade: 8 });

    const res = await withFailingWrites('tb_content', 'UPDATE', () =>
      api()
        .post(`/api/content/${contentId}/comment`)
        .set('Authorization', bearer(user))
        .send({ text: 'hello' }),
    );

    expect(res.status).toBe(500);
    expect(await countComments(contentId)).toBe(0);
    expect((await contentCounters(contentId)).comment_num).toBe(1);
  });

  it('returns 404 for an unknown or non-numeric content', async () => {
    const user = await createUser({ grade: 8 });

    for (const id of ['999999', 'abc']) {
      const res = await api()
        .post(`/api/content/${id}/comment`)
        .set('Authorization', bearer(user))
        .send({ text: 'hello' });

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ success: false, error: 'NOT_FOUND' });
    }
  });

  it('returns 404 for a deleted content', async () => {
    const board = await createBoard();
    const author = await createUser({ grade: 8 });
    const contentId = await createContent(author, board, {
      deleted_at: new Date(),
    });

    const res = await api()
      .post(`/api/content/${contentId}/comment`)
      .set('Authorization', bearer(author))
      .send({ text: 'hello' });

    expect(res.status).toBe(404);
    expect(await countComments(contentId)).toBe(0);
  });

  it('refuses a member who may not read the board with 403', async () => {
    const board = await createBoard({ lv_read: 6 });
    const staff = await createUser({ grade: 6 });
    const contentId = await createContent(staff, board);
    const member = await createUser({ grade: 8 });

    const res = await api()
      .post(`/api/content/${contentId}/comment`)
      .set('Authorization', bearer(member))
      .send({ text: 'hello' });

    expect(res.status).toBe(403);
    expect(res.body).toEqual(FORBIDDEN);
    expect(await countComments(contentId)).toBe(0);
  });

  it('adds a reply to a comment on the same content', async () => {
    const { contentId, author } = await setup();
    const parentId = await createComment(author, contentId);

    const res = await api()
      .post(`/api/content/${contentId}/comment`)
      .set('Authorization', bearer(author))
      .send({ text: 'reply', parent_comment_id: parentId });

    expect(res.status).toBe(200);
    expect(await countComments(contentId)).toBe(2);
  });

  it('refuses a reply to a comment on another content with 400', async () => {
    const { board, contentId, author } = await setup();
    const otherId = await createContent(author, board);
    const parentId = await createComment(author, otherId);

    for (const parent of [parentId, 999999]) {
      const res = await api()
        .post(`/api/content/${contentId}/comment`)
        .set('Authorization', bearer(author))
        .send({ text: 'reply', parent_comment_id: parent });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, error: 'BAD_REQUEST' });
    }
    expect(await countComments(contentId)).toBe(0);
  });

  it('answers a body of the wrong shape with 400', async () => {
    const { contentId } = await setup();
    const user = await createUser({ grade: 8 });

    const res = await api()
      .post(`/api/content/${contentId}/comment`)
      .set('Authorization', bearer(user))
      .send({ text: 42 });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, error: 'BAD_REQUEST' });
    expect(await countComments(contentId)).toBe(0);
  });

  it('refuses a body over 100kb with 413, like Express did', async () => {
    const { contentId } = await setup();
    const user = await createUser({ grade: 8 });

    const response = await api()
      .post(`/api/content/${contentId}/comment`)
      .set('Authorization', bearer(user))
      .send({ text: 'a'.repeat(101 * 1024) });

    expect(response.status).toBe(413);
    expect(response.body).toEqual({
      success: false,
      error: 'BAD_REQUEST',
      message: 'request entity too large',
    });
    expect(await countComments(contentId)).toBe(0);
  });

  it('answers malformed JSON with 400', async () => {
    const { contentId } = await setup();
    const user = await createUser({ grade: 8 });

    const res = await api()
      .post(`/api/content/${contentId}/comment`)
      .set('Authorization', bearer(user))
      .set('Content-Type', 'application/json')
      .send('{"text": ');

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, error: 'BAD_REQUEST' });
  });
});

describe('PATCH /api/comment/:comment_id', () => {
  it('lets the author change the text', async () => {
    const { contentId } = await setup();
    const user = await createUser({ grade: 8 });
    const commentId = await createComment(user, contentId);

    const res = await api()
      .patch(`/api/comment/${commentId}`)
      .set('Authorization', bearer(user))
      .send({ text: 'edited' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect((await commentState(commentId)).text).toBe('edited');
  });

  it('refuses another member', async () => {
    const { contentId } = await setup();
    const user = await createUser({ grade: 8 });
    const other = await createUser({ grade: 8 });
    const commentId = await createComment(user, contentId, { text: 'mine' });

    const res = await api()
      .patch(`/api/comment/${commentId}`)
      .set('Authorization', bearer(other))
      .send({ text: 'edited' });

    expect(res.status).toBe(403);
    expect((await commentState(commentId)).text).toBe('mine');
  });

  it('accepts a trailing slash, like Express', async () => {
    const { contentId } = await setup();
    const user = await createUser({ grade: 8 });
    const commentId = await createComment(user, contentId);

    const response = await api()
      .patch(`/api/comment/${commentId}/`)
      .set('Authorization', bearer(user))
      .send({ text: 'edited' });

    expect(response.status).toBe(200);
    expect((await commentState(commentId)).text).toBe('edited');
  });

  it('returns 404 for a deleted comment', async () => {
    const { contentId } = await setup();
    const user = await createUser({ grade: 8 });
    const commentId = await createComment(user, contentId, {
      text: 'gone',
      deleted_at: new Date(),
    });

    const res = await api()
      .patch(`/api/comment/${commentId}`)
      .set('Authorization', bearer(user))
      .send({ text: 'edited' });

    expect(res.status).toBe(404);
    expect((await commentState(commentId)).text).toBe('gone');
  });
});

describe('DELETE /api/comment/:comment_id', () => {
  it('soft-deletes the comment and uncounts it', async () => {
    const { contentId } = await setup();
    const user = await createUser({ grade: 8 });
    const commentId = await createComment(user, contentId);

    const res = await api()
      .delete(`/api/comment/${commentId}`)
      .set('Authorization', bearer(user));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect((await commentState(commentId)).deleted).toBe(true);
    expect((await contentCounters(contentId)).comment_num).toBe(0);
  });

  it('lets a grade within the board edit level delete it', async () => {
    const { contentId } = await setup();
    const user = await createUser({ grade: 8 });
    const admin = await createUser({ grade: 1 });
    const commentId = await createComment(user, contentId);

    const res = await api()
      .delete(`/api/comment/${commentId}`)
      .set('Authorization', bearer(admin));

    expect(res.status).toBe(200);
    expect((await commentState(commentId)).deleted).toBe(true);
  });

  it('keeps the comment when uncounting it fails', async () => {
    const { contentId } = await setup();
    const user = await createUser({ grade: 8 });
    const commentId = await createComment(user, contentId);

    const res = await withFailingWrites('tb_content', 'UPDATE', () =>
      api()
        .delete(`/api/comment/${commentId}`)
        .set('Authorization', bearer(user)),
    );

    expect(res.status).toBe(500);
    expect((await commentState(commentId)).deleted).toBe(false);
    expect((await contentCounters(contentId)).comment_num).toBe(1);
  });

  it('uncounts the comment once when deleted twice at once', async () => {
    const { contentId } = await setup();
    const user = await createUser({ grade: 8 });
    const commentId = await createComment(user, contentId);

    const responses = await Promise.all([
      api()
        .delete(`/api/comment/${commentId}`)
        .set('Authorization', bearer(user)),
      api()
        .delete(`/api/comment/${commentId}`)
        .set('Authorization', bearer(user)),
    ]);

    // The second gets 404 when it reads the comment after the first commits.
    const statuses = responses.map((r) => r.status).sort();
    expect([
      [200, 200],
      [200, 404],
    ]).toContainEqual(statuses);
    expect((await commentState(commentId)).deleted).toBe(true);
    expect((await contentCounters(contentId)).comment_num).toBe(0);
  });

  it('returns 404 for an unknown comment', async () => {
    const user = await createUser({ grade: 8 });

    const res = await api()
      .delete('/api/comment/999999')
      .set('Authorization', bearer(user));

    expect(res.status).toBe(404);
  });

  it('returns 404 for a non-numeric id', async () => {
    const user = await createUser({ grade: 8 });

    const res = await api()
      .delete('/api/comment/abc')
      .set('Authorization', bearer(user));

    expect(res.status).toBe(404);
  });
});

describe('POST /api/comment/:comment_id/like', () => {
  it('refuses a member who may not read the board with 403', async () => {
    const board = await createBoard({ lv_read: 6 });
    const staff = await createUser({ grade: 6 });
    const contentId = await createContent(staff, board);
    const commentId = await createComment(staff, contentId);
    const member = await createUser({ grade: 8 });

    const res = await api()
      .post(`/api/comment/${commentId}/like`)
      .set('Authorization', bearer(member));

    expect(res.status).toBe(403);
    expect(res.body).toEqual(FORBIDDEN);
    expect(await hasCommentLike(member, commentId)).toBe(false);
  });

  it('likes, then unlikes on the second call', async () => {
    const { contentId, author } = await setup();
    const user = await createUser({ grade: 8 });
    const commentId = await createComment(author, contentId);

    const first = await api()
      .post(`/api/comment/${commentId}/like`)
      .set('Authorization', bearer(user));
    expect(first.status).toBe(200);
    expect(first.body).toEqual({ success: true });
    expect(await hasCommentLike(user, commentId)).toBe(true);

    const second = await api()
      .post(`/api/comment/${commentId}/like`)
      .set('Authorization', bearer(user));
    expect(second.status).toBe(200);
    expect(await hasCommentLike(user, commentId)).toBe(false);
  });

  it('only removes the caller’s like', async () => {
    const { contentId, author } = await setup();
    const user = await createUser({ grade: 8 });
    const commentId = await createComment(author, contentId);
    await createCommentLike(user, commentId);
    await createCommentLike(author, commentId);

    await api()
      .post(`/api/comment/${commentId}/like`)
      .set('Authorization', bearer(user));

    expect(await hasCommentLike(user, commentId)).toBe(false);
    expect(await hasCommentLike(author, commentId)).toBe(true);
  });

  it('handles two calls at once as like then unlike', async () => {
    const { contentId, author } = await setup();
    const user = await createUser({ grade: 8 });
    const commentId = await createComment(author, contentId);

    const responses = await Promise.all([
      api()
        .post(`/api/comment/${commentId}/like`)
        .set('Authorization', bearer(user)),
      api()
        .post(`/api/comment/${commentId}/like`)
        .set('Authorization', bearer(user)),
    ]);

    expect(responses.map((r) => r.status)).toEqual([200, 200]);
    expect(await hasCommentLike(user, commentId)).toBe(false);
  });

  it('returns 404 for an unknown comment', async () => {
    const user = await createUser({ grade: 8 });

    const res = await api()
      .post('/api/comment/999999/like')
      .set('Authorization', bearer(user));

    expect(res.status).toBe(404);
  });
});
