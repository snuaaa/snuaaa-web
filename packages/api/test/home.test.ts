import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import {
  bearer,
  createAlbum,
  createBoard,
  createContent,
  createDocument,
  createPhoto,
  createPost,
  createUser,
  type User,
} from './helpers/factories';
import { softDeleteUser } from './helpers/db';

/*
 * The home page reads (`HomeService`): the notice box, the newest posts and
 * documents, the all-posts feed, the newest albums of the memory board, the
 * newest photos of the astrophoto board, and tonight's rise and set times.
 */

const DAY = 24 * 60 * 60 * 1000;
const BASE = new Date('2024-03-01T10:00:00.000Z').getTime();
const day = (n: number) => new Date(BASE + n * DAY);

const NOTICE_BOARD = 'brd01';
const MEMORY_BOARD = 'brd31';
const ASTROPHOTO_BOARD = 'brd32';

function as(user: User) {
  return { Authorization: bearer(user) };
}

function get(path: string, user: User) {
  return api().get(`/api/home/${path}`).set(as(user));
}

function contentJson(
  contentId: number,
  author: User,
  boardId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    content_id: contentId,
    content_uuid: expect.any(String),
    author_id: author.user_id,
    board_id: boardId,
    category_id: null,
    type: 'PO',
    parent_id: null,
    title: expect.any(String),
    text: expect.any(String),
    view_num: 0,
    comment_num: 0,
    like_num: 0,
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
    deletedAt: null,
    ...overrides,
  };
}

function photoJson(contentId: number) {
  return {
    content_id: contentId,
    file_path: null,
    thumbnail_path: null,
    img_url: expect.any(String),
    thumbnail_url: expect.any(String),
    location: null,
    camera: null,
    lens: null,
    exposure_time: null,
    focal_length: null,
    f_stop: null,
    iso: null,
    date: null,
  };
}

const ids = (body: { content_id: number }[]) =>
  body.map((row) => row.content_id);

describe('GET /api/home/soundbox', () => {
  it('answers the most recently updated post of the notice board', async () => {
    const author = await createUser({ grade: 8 });
    const notice = await createBoard({ board_id: NOTICE_BOARD });
    await createPost(author, notice, { updated_at: day(1) });
    const latest = await createPost(author, notice, {
      title: 'Notice',
      text: 'Hello',
      updated_at: day(2),
    });
    await createPost(author, notice, {
      updated_at: day(3),
      deleted_at: day(3),
    });
    await createDocument(author, notice, { updated_at: day(4) });
    await createPost(author, await createBoard(), { updated_at: day(5) });

    const response = await get('soundbox', await createUser());

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      content_id: latest,
      title: 'Notice',
      text: 'Hello',
      post: { content_id: latest },
    });
  });

  it('answers null when the notice board has no post', async () => {
    await createBoard({ board_id: NOTICE_BOARD });

    const response = await get('soundbox', await createUser());

    expect(response.status).toBe(200);
    expect(response.body).toBeNull();
  });
});

describe('GET /api/home/posts', () => {
  it('answers the 7 most recently updated posts and documents on readable boards', async () => {
    const author = await createUser({ grade: 8 });
    const board = await createBoard({ lv_read: 9 });
    const staffBoard = await createBoard({ lv_read: 6 });
    const document = await createDocument(author, board, {
      updated_at: day(2),
    });
    const post = await createPost(author, board, { updated_at: day(1) });
    await createPost(author, board, { updated_at: day(9), deleted_at: day(9) });
    await createPost(author, staffBoard, { updated_at: day(9) });
    await createPhoto(author, board, { updated_at: day(9) });
    const posts = [];
    for (let n = 3; n < 8; n += 1) {
      posts.push(await createPost(author, board, { updated_at: day(n) }));
    }
    await createPost(author, board, { updated_at: day(0) });

    const response = await get('posts', await createUser({ grade: 8 }));

    expect(response.status).toBe(200);
    expect(ids(response.body)).toEqual([...posts.reverse(), document, post]);
    const boardJson = {
      board_id: board.board_id,
      board_name: board.board_name,
    };
    expect(response.body[5]).toEqual({
      ...contentJson(document, author, board.board_id, { type: 'DO' }),
      post: null,
      document: { content_id: document, generation: 40 },
      board: boardJson,
    });
    expect(response.body[6]).toEqual({
      ...contentJson(post, author, board.board_id),
      post: { content_id: post },
      document: null,
      board: boardJson,
    });
  });
});

describe('GET /api/home/posts/all', () => {
  it('answers a page of 10 posts on readable boards, most recently updated first, with their author', async () => {
    const author = await createUser({ grade: 8 });
    const board = await createBoard({ lv_read: 9 });
    const staffBoard = await createBoard({ lv_read: 6 });
    const posts = [];
    for (let n = 0; n < 11; n += 1) {
      posts.push(await createPost(author, board, { updated_at: day(n) }));
    }
    await createPost(author, staffBoard, { updated_at: day(20) });
    await createDocument(author, board, { updated_at: day(20) });
    await createContent(author, board, { updated_at: day(20) });
    await createPost(author, board, {
      updated_at: day(20),
      deleted_at: day(20),
    });
    await softDeleteUser(author);
    const reader = await createUser({ grade: 8 });

    const first = await get('posts/all', reader);
    const second = await get('posts/all?page=2', reader);
    const invalid = await get('posts/all?page=abc', reader);

    expect(first.status).toBe(200);
    expect(first.body.postCount).toBe(11);
    expect(ids(first.body.postInfo)).toEqual(posts.slice(1).reverse());
    expect(first.body.postInfo[0]).toEqual({
      ...contentJson(posts[10], author, board.board_id),
      post: { content_id: posts[10] },
      board: { board_id: board.board_id, board_name: board.board_name },
      user: {
        nickname: author.nickname,
        profile_path: null,
        profile_url: null,
      },
    });
    expect(second.body).toEqual({
      postCount: 11,
      postInfo: [expect.objectContaining({ content_id: posts[0] })],
    });
    expect(invalid.body).toEqual(first.body);
  });
});

describe('GET /api/home/memory', () => {
  it('answers the 4 newest albums of the memory board, with their cover and newest photo', async () => {
    const author = await createUser({ grade: 8 });
    const memory = await createBoard({ board_id: MEMORY_BOARD });
    const oldest = await createAlbum(author, memory, { created_at: day(0) });
    const album = await createAlbum(author, memory, { created_at: day(1) });
    const olderPhoto = await createPhoto(author, memory, {
      parent_id: album,
      created_at: day(1),
    });
    const newerPhoto = await createPhoto(author, memory, {
      parent_id: album,
      created_at: day(2),
    });
    const covered = await createAlbum(author, memory, {
      created_at: day(3),
      tn_photo_id: olderPhoto,
      is_private: true,
    });
    const newest = await createAlbum(author, memory, { created_at: day(4) });
    const fifth = await createAlbum(author, memory, { created_at: day(5) });
    await createAlbum(author, memory, {
      created_at: day(6),
      deleted_at: day(6),
    });
    await createAlbum(author, await createBoard(), { created_at: day(7) });

    const response = await get('memory', await createUser());

    expect(response.status).toBe(200);
    expect(ids(response.body)).toEqual([fifth, newest, covered, album]);
    expect(ids(response.body)).not.toContain(oldest);
    const userJson = {
      user_id: author.user_id,
      user_uuid: author.user_uuid,
      nickname: author.nickname,
      introduction: null,
      grade: 8,
      level: author.level,
      profile_path: null,
      profile_url: null,
      deleted_at: null,
    };
    const photo = (contentId: number) => ({
      ...contentJson(contentId, author, MEMORY_BOARD, {
        type: 'PH',
        parent_id: album,
      }),
      photo: photoJson(contentId),
    });
    expect(response.body[2]).toEqual({
      ...contentJson(covered, author, MEMORY_BOARD, { type: 'AL' }),
      album: {
        content_id: covered,
        is_private: true,
        tn_photo_id: olderPhoto,
        thumbnail: photo(olderPhoto),
      },
      user: userJson,
      category: null,
      children: [],
    });
    expect(response.body[3]).toEqual({
      ...contentJson(album, author, MEMORY_BOARD, { type: 'AL' }),
      album: {
        content_id: album,
        is_private: false,
        tn_photo_id: null,
        thumbnail: null,
      },
      user: userJson,
      category: null,
      children: [photo(newerPhoto)],
    });
  });
});

describe('GET /api/home/astrophoto', () => {
  it('answers the 9 newest photos of the astrophoto board, with their author name', async () => {
    const photographer = await createUser({ grade: 8 });
    const astrophoto = await createBoard({ board_id: ASTROPHOTO_BOARD });
    const photos = [];
    for (let n = 0; n < 10; n += 1) {
      photos.push(
        await createPhoto(photographer, astrophoto, { created_at: day(n) }),
      );
    }
    await createPhoto(photographer, astrophoto, {
      created_at: day(20),
      deleted_at: day(20),
    });
    await createPhoto(photographer, await createBoard(), {
      created_at: day(20),
    });
    await softDeleteUser(photographer);

    const response = await get('astrophoto', await createUser());

    expect(response.status).toBe(200);
    expect(ids(response.body)).toEqual(photos.slice(1).reverse());
    expect(response.body[0]).toEqual({
      ...contentJson(photos[9], photographer, ASTROPHOTO_BOARD, {
        type: 'PH',
      }),
      photo: photoJson(photos[9]),
      user: { nickname: photographer.nickname, deleted_at: expect.any(String) },
    });
  });
});

describe('GET /api/home/riseset', () => {
  it("answers tonight's rise and set times in minutes and the moon's age", async () => {
    const response = await get('riseset', await createUser());

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ lunAge: expect.any(Number) }),
    );
    for (const key of ['sunrise', 'sunset', 'astm', 'aste']) {
      expect(response.body[key]).toEqual(expect.any(Number));
    }
  });
});

describe('home reads after the move', () => {
  it("hides the notice, albums and photos of boards the member can't read", async () => {
    const author = await createUser({ grade: 6 });
    const notice = await createBoard({ board_id: NOTICE_BOARD, lv_read: 6 });
    const memory = await createBoard({ board_id: MEMORY_BOARD, lv_read: 6 });
    const astrophoto = await createBoard({
      board_id: ASTROPHOTO_BOARD,
      lv_read: 6,
    });
    await createPost(author, notice);
    await createAlbum(author, memory);
    await createPhoto(author, astrophoto);
    const member = await createUser({ grade: 8 });

    const responses = [
      await get('soundbox', member),
      await get('memory', member),
      await get('astrophoto', member),
    ];

    expect(responses.map((response) => response.status)).toEqual([
      200, 200, 200,
    ]);
    expect(responses.map((response) => response.body)).toEqual([null, [], []]);
  });

  it('no longer serves the comment lists the web stopped calling', async () => {
    const user = await createUser();

    const responses = [
      await get('comments', user),
      await get('comments/all', user),
    ];

    expect(responses.map((response) => response.status)).toEqual([404, 404]);
  });
});
