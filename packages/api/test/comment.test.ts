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

  it('keeps the count when the delete fails', async () => {
    const { contentId } = await setup();
    const user = await createUser({ grade: 8 });
    const commentId = await createComment(user, contentId);

    const res = await withFailingWrites('tb_comment', 'UPDATE', () =>
      api()
        .delete(`/api/comment/${commentId}`)
        .set('Authorization', bearer(user)),
    );

    expect(res.status).toBe(500);
    expect((await commentState(commentId)).deleted).toBe(false);
    expect((await contentCounters(contentId)).comment_num).toBe(1);
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
});
