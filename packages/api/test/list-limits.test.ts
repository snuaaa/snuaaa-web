import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import {
  bearer,
  createBoard,
  createComment,
  createPhoto,
  createPost,
  createUser,
  type User,
} from './helpers/factories';

/*
 * The paged lists take the page size from the query. The web asks for 24 at
 * most, so a request can't ask for more than 100 rows at once, and a size
 * or offset that isn't a positive number falls back to the default.
 */

const MAXIMUM = 100;

function get(path: string, user: User) {
  return api().get(path).set('Authorization', bearer(user));
}

async function setup(rows: number) {
  const author = await createUser({ grade: 6 });
  const board = await createBoard();
  const postId = await createPost(author, board);
  for (let n = 0; n < rows; n += 1) {
    await Promise.all([
      createPost(author, board),
      createPhoto(author, board),
      createComment(author, postId),
      createUser(),
    ]);
  }
  return author;
}

describe('the paged lists', () => {
  it.each([
    ['posts', '/api/post/list', 'rows'],
    ['photos', '/api/photo/list', 'rows'],
    ['comments', '/api/comment/list', 'rows'],
    ['members', '/api/userinfo/all', 'userInfo'],
  ])(
    `answer at most ${MAXIMUM} %s at once`,
    async (_list, path, rowsKey) => {
      const author = await setup(MAXIMUM + 1);

      const response = await get(`${path}?limit=1000`, author);

      expect(response.status).toBe(200);
      expect(response.body[rowsKey]).toHaveLength(MAXIMUM);
      expect(response.body.count).toBeGreaterThan(MAXIMUM);
    },
    30_000,
  );

  it('read a negative comment page size or offset as the default', async () => {
    const author = await setup(3);

    const responses = [
      await get('/api/comment/list?limit=-1', author),
      await get('/api/comment/list?offset=-1', author),
      await get('/api/comment/list?limit=abc&offset=abc', author),
    ];

    expect(responses.map((response) => response.status)).toEqual([
      200, 200, 200,
    ]);
    expect(responses.map((response) => response.body.rows.length)).toEqual([
      3, 3, 3,
    ]);
  });
});
