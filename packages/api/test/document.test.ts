import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import {
  bearer,
  createBoard,
  createCategory,
  createDocument,
  createPost,
  createUser,
} from './helpers/factories';
import {
  contentState,
  countContents,
  documentRow,
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
  const { category_id } = await createCategory(board);
  return { board, author, categoryId: category_id };
}

describe('POST /api/board/:board_id/document', () => {
  it('creates a document from the body the web sends', async () => {
    const { board, author, categoryId } = await setup();

    // `CreateDocu.tsx`: generation is a number, category_id a string.
    const response = await api()
      .post(`/api/board/${board.board_id}/document`)
      .set('Authorization', bearer(author))
      .send({
        title: 'minutes',
        text: '<p>notes</p>',
        generation: 91,
        category_id: categoryId,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      content_id: expect.any(Number),
      success: true,
    });
    const contentId = response.body.content_id;
    expect(await contentState(contentId)).toMatchObject({
      type: 'DO',
      author_id: author.user_id,
      board_id: board.board_id,
      category_id: categoryId,
      title: 'minutes',
      text: '<p>notes</p>',
      deleted_at: null,
    });
    expect(await documentRow(contentId)).toEqual({ generation: 91 });

    const read = await api()
      .get(`/api/document/${contentId}`)
      .set('Authorization', bearer(author));
    expect(read.status).toBe(200);
    expect(read.body.docuInfo).toMatchObject({
      content_id: contentId,
      title: 'minutes',
      document: { generation: 91 },
    });
  });

  it('accepts a generation sent as a string, and stores no generation for an empty one', async () => {
    const { board, author, categoryId } = await setup();

    const asString = await api()
      .post(`/api/board/${board.board_id}/document`)
      .set('Authorization', bearer(author))
      .send({
        title: 'a',
        text: '',
        generation: '90',
        category_id: categoryId,
      });
    expect(asString.status).toBe(200);
    expect(await documentRow(asString.body.content_id)).toEqual({
      generation: 90,
    });

    for (const generation of ['', 0, null, undefined]) {
      const empty = await api()
        .post(`/api/board/${board.board_id}/document`)
        .set('Authorization', bearer(author))
        .send({ title: 'b', text: '', generation, category_id: categoryId });
      expect(empty.status).toBe(200);
      expect(await documentRow(empty.body.content_id)).toEqual({
        generation: null,
      });
    }
  });

  it('keeps no content when the document row fails', async () => {
    const { board, author, categoryId } = await setup();

    const response = await withFailingWrites('tb_document', 'INSERT', () =>
      api()
        .post(`/api/board/${board.board_id}/document`)
        .set('Authorization', bearer(author))
        .send({
          title: 'a',
          text: '',
          generation: 91,
          category_id: categoryId,
        }),
    );

    expect(response.status).toBe(500);
    expect(await countContents({ board_id: board.board_id })).toBe(0);
  });

  it('returns 404 for an unknown board', async () => {
    const { author } = await setup();

    const response = await api()
      .post('/api/board/b_missing/document')
      .set('Authorization', bearer(author))
      .send({ title: 'a', text: '', generation: 91 });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ success: false, error: 'NOT_FOUND' });
  });
});

describe('PATCH /api/document/:doc_id', () => {
  it('changes the title, text and category from the body the web sends', async () => {
    const { board, author, categoryId } = await setup();
    const other = await createCategory(board);
    const updatedAt = new Date('2020-01-01T00:00:00Z');
    const documentId = await createDocument(author, board, {
      category_id: categoryId,
      updated_at: updatedAt,
      generation: 80,
    });

    // `EditDocu.tsx` sends title, text and category_id, never generation.
    const response = await api()
      .patch(`/api/document/${documentId}`)
      .set('Authorization', bearer(author))
      .send({
        title: 'edited',
        text: 'new text',
        category_id: other.category_id,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    const state = await contentState(documentId);
    expect(state).toMatchObject({
      title: 'edited',
      text: 'new text',
      category_id: other.category_id,
    });
    expect(state.updated_at.getTime()).toBeGreaterThan(updatedAt.getTime());
    expect(await documentRow(documentId)).toEqual({ generation: 80 });
  });

  it('returns 404 for a content that is not a document', async () => {
    const { board, author } = await setup();
    const postId = await createPost(author, board);

    const response = await api()
      .patch(`/api/document/${postId}`)
      .set('Authorization', bearer(author))
      .send({ title: 'edited' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual(NOT_FOUND);
    expect((await contentState(postId)).title).not.toBe('edited');
  });

  it('returns 404 for a deleted document', async () => {
    const { board, author } = await setup();
    const documentId = await createDocument(author, board, {
      deleted_at: new Date(),
    });

    const response = await api()
      .patch(`/api/document/${documentId}`)
      .set('Authorization', bearer(author))
      .send({ title: 'edited' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual(NOT_FOUND);
  });

  it('returns 404 for a non-numeric id', async () => {
    const { author } = await setup();

    const response = await api()
      .patch('/api/document/abc')
      .set('Authorization', bearer(author))
      .send({ title: 'edited' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual(NOT_FOUND);
  });
});

describe('DELETE /api/document/:doc_id', () => {
  it('soft-deletes the content and removes the document row', async () => {
    const { board, author } = await setup();
    const documentId = await createDocument(author, board);

    const response = await api()
      .delete(`/api/document/${documentId}`)
      .set('Authorization', bearer(author));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect((await contentState(documentId)).deleted_at).not.toBeNull();
    expect(await documentRow(documentId)).toBeUndefined();

    const read = await api()
      .get(`/api/document/${documentId}`)
      .set('Authorization', bearer(author));
    expect(read.status).toBe(404);

    const again = await api()
      .delete(`/api/document/${documentId}`)
      .set('Authorization', bearer(author));
    expect(again.status).toBe(404);
    expect(again.body).toEqual(NOT_FOUND);
  });

  it('keeps the document when soft-deleting the content fails', async () => {
    const { board, author } = await setup();
    const documentId = await createDocument(author, board);

    const response = await withFailingWrites('tb_content', 'UPDATE', () =>
      api()
        .delete(`/api/document/${documentId}`)
        .set('Authorization', bearer(author)),
    );

    expect(response.status).toBe(500);
    expect((await contentState(documentId)).deleted_at).toBeNull();
    expect(await documentRow(documentId)).toEqual({ generation: 40 });
  });

  it('returns 404 for a content that is not a document', async () => {
    const { board, author } = await setup();
    const postId = await createPost(author, board);

    const response = await api()
      .delete(`/api/document/${postId}`)
      .set('Authorization', bearer(author));

    expect(response.status).toBe(404);
    expect((await contentState(postId)).deleted_at).toBeNull();
  });

  it('returns 404 for a non-numeric id', async () => {
    const { author } = await setup();

    const response = await api()
      .delete('/api/document/abc')
      .set('Authorization', bearer(author));

    expect(response.status).toBe(404);
    expect(response.body).toEqual(NOT_FOUND);
  });
});
