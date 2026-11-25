import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import {
  bearer,
  createBoard,
  createCategory,
  createTag,
  createUser,
  type User,
} from './helpers/factories';

/*
 * The board reads the web makes: the board list for the menus
 * (`BoardService.retrieveBoards`) and one board's info, with its tags and
 * categories (`BoardService.retrieveBoardInfo`).
 */

function as(user: User) {
  return { Authorization: bearer(user) };
}

describe('GET /api/board', () => {
  it('lists only the boards the grade can read, in menu order', async () => {
    await createBoard({ board_id: 'b_all', menu: 1, order: 2, lv_read: 10 });
    await createBoard({ board_id: 'b_member', menu: 1, order: 1, lv_read: 8 });
    await createBoard({ board_id: 'b_admin', menu: 0, order: 1, lv_read: 1 });

    const member = await createUser({ grade: 8 });
    const res = await api()
      .get('/api/board')
      .set('Authorization', bearer(member));

    expect(res.status).toBe(200);
    expect(res.body.map((b) => b.board_id)).toEqual(['b_member', 'b_all']);
    expect(res.body[0]).toMatchObject({ tags: [], categories: [] });
  });

  it('answers every board with its tags and categories', async () => {
    const board = await createBoard({
      board_id: 'b_photo',
      board_type: 'A',
      board_desc: 'Photos',
      menu: 2,
      order: 1,
      lv_read: 10,
      lv_write: 9,
      lv_edit: 6,
    });
    const tagId = (await createTag(board)).tag_id;
    const categoryId = (await createCategory(board)).category_id;
    await createBoard({ board_id: 'b_other', menu: 3 });

    const res = await api()
      .get('/api/board')
      .set(as(await createUser()));

    expect(res.body).toEqual([
      {
        board_id: 'b_photo',
        board_name: board.board_name,
        board_type: 'A',
        board_desc: 'Photos',
        menu: 2,
        order: 1,
        lv_read: 10,
        lv_write: 9,
        lv_edit: 6,
        tags: [
          {
            tag_id: tagId,
            board_id: 'b_photo',
            tag_name: expect.any(String),
            tag_type: 'M',
          },
        ],
        categories: [
          {
            category_id: categoryId,
            board_id: 'b_photo',
            category_name: expect.any(String),
            category_color: null,
          },
        ],
      },
      expect.objectContaining({
        board_id: 'b_other',
        board_desc: null,
        tags: [],
        categories: [],
      }),
    ]);
  });

  it('requires a token', async () => {
    const res = await api().get('/api/board');

    expect(res.status).toBe(401);
  });
});

describe('GET /api/board/:board_id', () => {
  it('answers the board with its tags and categories', async () => {
    const board = await createBoard({ lv_read: 8, board_desc: 'Notices' });
    const tagId = (await createTag(board)).tag_id;
    const categoryId = (await createCategory(board)).category_id;
    await createTag(await createBoard());

    const res = await api()
      .get(`/api/board/${board.board_id}`)
      .set(as(await createUser({ grade: 8 })));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      boardInfo: {
        board_id: board.board_id,
        board_name: board.board_name,
        board_type: 'N',
        board_desc: 'Notices',
        menu: 1,
        order: expect.any(Number),
        lv_read: 8,
        lv_write: 10,
        lv_edit: 10,
        tags: [expect.objectContaining({ tag_id: tagId })],
        categories: [expect.objectContaining({ category_id: categoryId })],
      },
    });
  });

  it("refuses a board the grade can't read", async () => {
    const board = await createBoard({ lv_read: 6 });

    const res = await api()
      .get(`/api/board/${board.board_id}`)
      .set(as(await createUser({ grade: 8 })));

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      success: false,
      error: 'FORBIDDEN',
      message: 'Permission denied',
      code: 4001,
    });
  });

  it('answers 404 for an unknown board', async () => {
    const res = await api()
      .get('/api/board/nope')
      .set(as(await createUser()));

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      error: 'NOT_FOUND',
      message: 'id is not correct',
    });
  });
});

describe('board reads after the move', () => {
  it('no longer serves the post and tag lists the web stopped calling', async () => {
    const board = await createBoard();
    const user = await createUser();

    const responses = [
      await api().get(`/api/board/${board.board_id}/posts`).set(as(user)),
      await api().get(`/api/board/${board.board_id}/tags`).set(as(user)),
    ];

    expect(responses.map((response) => response.status)).toEqual([404, 404]);
  });
});
