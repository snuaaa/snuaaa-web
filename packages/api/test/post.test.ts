import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import {
  bearer,
  createBoard,
  createCategory,
  createContent,
  createPost,
  createUser,
} from './helpers/factories';
import {
  contentState,
  countContents,
  hasPostRow,
  withFailingWrites,
} from './helpers/db';

const NOT_FOUND = {
  success: false,
  error: 'NOT_FOUND',
  message: 'Content not found',
};

async function setup() {
  const board = await createBoard({ lv_read: 10, lv_write: 10, lv_edit: 1 });
  const author = await createUser({ grade: 8 });
  return { board, author };
}

describe('POST /api/board/:board_id/post', () => {
  it('creates a post by the signed-in user', async () => {
    const { board, author } = await setup();

    const response = await api()
      .post(`/api/board/${board.board_id}/post`)
      .set('Authorization', bearer(author))
      .send({ title: 'hello', text: '<p>world</p>' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      content_id: expect.any(Number),
      success: true,
    });
    const contentId = response.body.content_id;
    expect(await contentState(contentId)).toMatchObject({
      type: 'PO',
      author_id: author.user_id,
      board_id: board.board_id,
      title: 'hello',
      text: '<p>world</p>',
      deleted_at: null,
    });
    expect(await hasPostRow(contentId)).toBe(true);

    const read = await api()
      .get(`/api/post/${contentId}`)
      .set('Authorization', bearer(author));
    expect(read.status).toBe(200);
    expect(read.body.postInfo).toMatchObject({
      content_id: contentId,
      title: 'hello',
      view_num: 0,
      comment_num: 0,
      like_num: 0,
    });
  });

  it('ignores an author or board sent in the body', async () => {
    const { board, author } = await setup();
    const other = await createUser({ grade: 8 });
    const otherBoard = await createBoard();

    const response = await api()
      .post(`/api/board/${board.board_id}/post`)
      .set('Authorization', bearer(author))
      .send({
        title: 'hello',
        text: 'world',
        author_id: other.user_id,
        board_id: otherBoard.board_id,
      });

    expect(response.status).toBe(200);
    expect(await contentState(response.body.content_id)).toMatchObject({
      author_id: author.user_id,
      board_id: board.board_id,
    });
  });

  it('keeps no content when the post row fails', async () => {
    const { board, author } = await setup();

    const response = await withFailingWrites('tb_post', 'INSERT', () =>
      api()
        .post(`/api/board/${board.board_id}/post`)
        .set('Authorization', bearer(author))
        .send({ title: 'hello', text: 'world' }),
    );

    expect(response.status).toBe(500);
    expect(await countContents({ board_id: board.board_id })).toBe(0);
  });

  it('returns 404 for an unknown board', async () => {
    const { author } = await setup();

    const response = await api()
      .post('/api/board/b_missing/post')
      .set('Authorization', bearer(author))
      .send({ title: 'hello', text: 'world' });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ success: false, error: 'NOT_FOUND' });
  });
});

describe('PATCH /api/post/:post_id', () => {
  it('changes the title and text and keeps fields the body leaves out', async () => {
    const { board, author } = await setup();
    const { category_id } = await createCategory(board);
    const updatedAt = new Date('2020-01-01T00:00:00Z');
    const postId = await createPost(author, board, {
      category_id,
      updated_at: updatedAt,
    });

    const response = await api()
      .patch(`/api/post/${postId}`)
      .set('Authorization', bearer(author))
      .send({ title: 'edited', text: 'new text' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    const state = await contentState(postId);
    expect(state).toMatchObject({
      title: 'edited',
      text: 'new text',
      category_id,
    });
    expect(state.updated_at.getTime()).toBeGreaterThan(updatedAt.getTime());
  });

  it('returns 404 for a content that is not a post', async () => {
    const { board, author } = await setup();
    const documentId = await createContent(author, board, { type: 'DO' });

    const response = await api()
      .patch(`/api/post/${documentId}`)
      .set('Authorization', bearer(author))
      .send({ title: 'edited' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual(NOT_FOUND);
    expect((await contentState(documentId)).title).not.toBe('edited');
  });

  it('returns 404 for a deleted post', async () => {
    const { board, author } = await setup();
    const postId = await createPost(author, board, { deleted_at: new Date() });

    const response = await api()
      .patch(`/api/post/${postId}`)
      .set('Authorization', bearer(author))
      .send({ title: 'edited' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual(NOT_FOUND);
  });

  it('returns 404 for a non-numeric id', async () => {
    const { author } = await setup();

    const response = await api()
      .patch('/api/post/abc')
      .set('Authorization', bearer(author))
      .send({ title: 'edited' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual(NOT_FOUND);
  });

  it('answers a body of the wrong shape with 400', async () => {
    const { board, author } = await setup();
    const postId = await createPost(author, board);

    const response = await api()
      .patch(`/api/post/${postId}`)
      .set('Authorization', bearer(author))
      .send({ title: 42 });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: 'BAD_REQUEST',
    });
  });
});

describe('DELETE /api/post/:post_id', () => {
  it('soft-deletes the post, so it is no longer found', async () => {
    const { board, author } = await setup();
    const postId = await createPost(author, board);

    const response = await api()
      .delete(`/api/post/${postId}`)
      .set('Authorization', bearer(author));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect((await contentState(postId)).deleted_at).not.toBeNull();
    expect(await hasPostRow(postId)).toBe(true);

    const read = await api()
      .get(`/api/post/${postId}`)
      .set('Authorization', bearer(author));
    expect(read.status).toBe(404);

    const again = await api()
      .delete(`/api/post/${postId}`)
      .set('Authorization', bearer(author));
    expect(again.status).toBe(404);
    expect(again.body).toEqual(NOT_FOUND);
  });

  it('returns 404 for a content that is not a post', async () => {
    const { board, author } = await setup();
    const documentId = await createContent(author, board, { type: 'DO' });

    const response = await api()
      .delete(`/api/post/${documentId}`)
      .set('Authorization', bearer(author));

    expect(response.status).toBe(404);
    expect((await contentState(documentId)).deleted_at).toBeNull();
  });

  it('returns 404 for a non-numeric id', async () => {
    const { author } = await setup();

    const response = await api()
      .delete('/api/post/abc')
      .set('Authorization', bearer(author));

    expect(response.status).toBe(404);
    expect(response.body).toEqual(NOT_FOUND);
  });
});
