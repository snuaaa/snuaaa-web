import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import {
  bearer,
  createAlbum,
  createBoard,
  createCategory,
  createContentLike,
  createPhoto,
  createPost,
  createTag,
  createUser,
  tagContent,
  type Board,
  type User,
} from './helpers/factories';
import { contentState, softDeleteUser } from './helpers/db';

/*
 * The JSON the web reads from the album and photo read endpoints, kept as
 * the Sequelize version answered it (camelCase timestamps, a photo's tags
 * carrying their `contentTag` row, ...).
 */

const DAY = 24 * 60 * 60 * 1000;
const BASE = new Date('2024-03-01T10:00:00.000Z').getTime();
/** The n-th day after BASE, so rows sort by creation in a known order. */
const day = (n: number) => new Date(BASE + n * DAY);

async function setup() {
  const board = await createBoard({ lv_read: 10, lv_write: 10, lv_edit: 1 });
  const author = await createUser({ grade: 8 });
  return { board, author };
}

async function get(path: string, user: User) {
  return api().get(path).set('Authorization', bearer(user));
}

function contentJson(
  contentId: number,
  author: User,
  board: Board,
  overrides: Record<string, unknown> = {},
) {
  return {
    content_id: contentId,
    content_uuid: expect.any(String),
    author_id: author.user_id,
    board_id: board.board_id,
    category_id: null,
    type: 'PH',
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

function photoJson(contentId: number, overrides: Record<string, unknown> = {}) {
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
    ...overrides,
  };
}

function detailUserJson(user: User, overrides: Record<string, unknown> = {}) {
  return {
    user_id: user.user_id,
    user_uuid: user.user_uuid,
    nickname: user.nickname,
    introduction: null,
    grade: user.grade,
    level: user.level,
    profile_path: null,
    profile_url: null,
    deleted_at: null,
    ...overrides,
  };
}

function tagJson(tag: { tag_id: string }, board: Board) {
  return {
    tag_id: tag.tag_id,
    board_id: board.board_id,
    tag_name: expect.any(String),
    tag_type: 'M',
  };
}

describe('GET /api/album/:album_id', () => {
  it("returns the album with its author, board, and the board's categories and tags", async () => {
    const { board, author } = await setup();
    const { category_id } = await createCategory(board);
    const tag = await createTag(board);
    const albumId = await createAlbum(author, board, {
      category_id,
      title: 'Milky Way',
      text: 'summer',
      is_private: true,
      view_num: 3,
    });

    const response = await get(`/api/album/${albumId}`, author);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      albumInfo: {
        ...contentJson(albumId, author, board, {
          type: 'AL',
          category_id,
          title: 'Milky Way',
          text: 'summer',
          view_num: 3,
        }),
        album: { content_id: albumId, is_private: true, tn_photo_id: null },
        user: detailUserJson(author),
        board: {
          board_id: board.board_id,
          board_name: board.board_name,
          lv_read: 10,
        },
      },
      categoryInfo: [
        {
          category_id,
          board_id: board.board_id,
          category_name: expect.any(String),
          category_color: null,
        },
      ],
      tagInfo: [tagJson(tag, board)],
    });
    // Reading an album doesn't count a view.
    expect((await contentState(albumId)).view_num).toBe(3);
  });

  it('shows the author after they left the club', async () => {
    const { board, author } = await setup();
    const albumId = await createAlbum(author, board);
    await softDeleteUser(author);
    const reader = await createUser({ grade: 8 });

    const response = await get(`/api/album/${albumId}`, reader);

    expect(response.status).toBe(200);
    expect(response.body.albumInfo.user).toEqual(
      detailUserJson(author, { deleted_at: expect.any(String) }),
    );
  });

  it('rejects a grade above the board lv_read with 403', async () => {
    const board = await createBoard({ lv_read: 6 });
    const staff = await createUser({ grade: 6 });
    const albumId = await createAlbum(staff, board);
    const member = await createUser({ grade: 8 });

    const response = await get(`/api/album/${albumId}`, member);

    expect(response.status).toBe(403);
  });

  it('returns 404 for a missing or deleted album, or a content that is not one', async () => {
    const { board, author } = await setup();
    const deletedId = await createAlbum(author, board, { deleted_at: day(0) });
    const postId = await createPost(author, board);

    for (const id of [999999, deletedId, postId]) {
      const response = await get(`/api/album/${id}`, author);
      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        error: 'NOT_FOUND',
      });
    }
  });
});

describe('GET /api/album/:album_id/photos', () => {
  it("returns the album's photos, newest first, with their author's nickname", async () => {
    const { board, author } = await setup();
    const albumId = await createAlbum(author, board);
    const older = await createPhoto(author, board, {
      parent_id: albumId,
      created_at: day(1),
      photo: { camera: 'EOS', date: day(0) },
    });
    const newer = await createPhoto(author, board, {
      parent_id: albumId,
      created_at: day(2),
    });
    await createPhoto(author, board, {
      parent_id: albumId,
      deleted_at: day(3),
    });
    await createPhoto(author, board);

    const response = await get(`/api/album/${albumId}/photos`, author);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        ...contentJson(newer, author, board, { parent_id: albumId }),
        photo: photoJson(newer),
        user: { nickname: author.nickname, deleted_at: null },
      },
      {
        ...contentJson(older, author, board, { parent_id: albumId }),
        photo: photoJson(older, {
          camera: 'EOS',
          date: day(0).toISOString(),
        }),
        user: { nickname: author.nickname, deleted_at: null },
      },
    ]);
  });
});

describe('GET /api/photo/:photo_id', () => {
  it('returns the photo with its album, author, board, tags and neighbours', async () => {
    const { board, author } = await setup();
    const [tagB, tagA] = [await createTag(board), await createTag(board)];
    const albumId = await createAlbum(author, board, { is_private: false });
    const prev = await createPhoto(author, board, { parent_id: albumId });
    const photoId = await createPhoto(author, board, {
      parent_id: albumId,
      view_num: 5,
      photo: { location: 'Seoul', iso: '800' },
    });
    const next = await createPhoto(author, board, { parent_id: albumId });
    await tagContent(photoId, [tagA.tag_id, tagB.tag_id]);
    await createContentLike(author, photoId);

    const response = await get(`/api/photo/${photoId}`, author);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      photoInfo: {
        ...contentJson(photoId, author, board, {
          parent_id: albumId,
          view_num: 5,
          like_num: 0,
        }),
        photo: photoJson(photoId, { location: 'Seoul', iso: '800' }),
        parent: {
          ...contentJson(albumId, author, board, { type: 'AL' }),
          album: { content_id: albumId, is_private: false, tn_photo_id: null },
        },
        user: detailUserJson(author),
        board: {
          board_id: board.board_id,
          board_name: board.board_name,
          lv_read: 10,
        },
        // Sorted by tag_type, then tag_id.
        tags: [tagB, tagA].map((tag) => ({
          ...tagJson(tag, board),
          contentTag: { content_id: photoId, tag_id: tag.tag_id },
        })),
      },
      likeInfo: true,
      boardTagInfo: [tagJson(tagB, board), tagJson(tagA, board)],
      prevPhoto: {
        ...contentJson(prev, author, board, { parent_id: albumId }),
        photo: photoJson(prev),
      },
      nextPhoto: {
        ...contentJson(next, author, board, { parent_id: albumId }),
        photo: photoJson(next),
      },
      prevAlbumPhoto: null,
      nextAlbumPhoto: null,
    });
    // The view counts, but the answer shows the count from before it.
    expect((await contentState(photoId)).view_num).toBe(6);
  });

  it("skips deleted photos and leaves out a deleted album's details", async () => {
    const { board, author } = await setup();
    const albumId = await createAlbum(author, board, { deleted_at: day(0) });
    await createPhoto(author, board, {
      parent_id: albumId,
      deleted_at: day(0),
    });
    const photoId = await createPhoto(author, board, { parent_id: albumId });
    await createPhoto(author, board, {
      parent_id: albumId,
      deleted_at: day(0),
    });

    const response = await get(`/api/photo/${photoId}`, author);

    expect(response.status).toBe(200);
    expect(response.body.photoInfo.parent).toBeNull();
    expect(response.body.photoInfo.parent_id).toBe(albumId);
    expect(response.body.prevPhoto).toBeNull();
    expect(response.body.nextPhoto).toBeNull();
  });

  it("returns the nearest photos of the board's previous and next albums", async () => {
    const { board, author } = await setup();
    const otherBoard = await createBoard({ lv_read: 10 });
    const firstAlbum = await createAlbum(author, board);
    const firstOld = await createPhoto(author, board, {
      parent_id: firstAlbum,
    });
    const firstNew = await createPhoto(author, board, {
      parent_id: firstAlbum,
    });
    const elsewhere = await createAlbum(author, otherBoard);
    await createPhoto(author, otherBoard, { parent_id: elsewhere });
    const albumId = await createAlbum(author, board);
    const photoId = await createPhoto(author, board, { parent_id: albumId });
    const lastAlbum = await createAlbum(author, board);
    const lastOld = await createPhoto(author, board, { parent_id: lastAlbum });
    const lastNew = await createPhoto(author, board, { parent_id: lastAlbum });

    const response = await get(`/api/photo/${photoId}`, author);

    expect(response.status).toBe(200);
    // Both take the album's newest photo.
    expect(response.body.prevAlbumPhoto).toMatchObject({
      content_id: firstNew,
      parent_id: firstAlbum,
      photo: { content_id: firstNew },
    });
    expect(response.body.nextAlbumPhoto).toMatchObject({
      content_id: lastNew,
      parent_id: lastAlbum,
      photo: { content_id: lastNew },
    });
    expect([firstOld, lastOld]).not.toContain(
      response.body.prevAlbumPhoto.content_id,
    );
  });

  it("with navigation=user, steps through the author's photos on readable boards", async () => {
    const { board, author } = await setup();
    const staffBoard = await createBoard({ lv_read: 6 });
    const otherBoard = await createBoard({ lv_read: 10 });
    const someoneElse = await createUser({ grade: 8 });
    const prev = await createPhoto(author, otherBoard);
    await createPhoto(author, staffBoard);
    await createPhoto(someoneElse, board);
    const albumId = await createAlbum(author, board);
    const photoId = await createPhoto(author, board, { parent_id: albumId });
    await createPhoto(author, staffBoard);
    const next = await createPhoto(author, board);
    const member = await createUser({ grade: 8 });

    const response = await get(`/api/photo/${photoId}?navigation=user`, member);

    expect(response.status).toBe(200);
    expect(response.body.prevPhoto).toMatchObject({
      content_id: prev,
      photo: { content_id: prev },
    });
    expect(response.body.nextPhoto).toMatchObject({
      content_id: next,
      photo: { content_id: next },
    });
  });

  it('rejects a grade above the board lv_read with 403', async () => {
    const board = await createBoard({ lv_read: 6 });
    const staff = await createUser({ grade: 6 });
    const photoId = await createPhoto(staff, board);
    const member = await createUser({ grade: 8 });

    const response = await get(`/api/photo/${photoId}`, member);

    expect(response.status).toBe(403);
    expect((await contentState(photoId)).view_num).toBe(0);
  });

  it('returns 404 for a missing or deleted photo, or a content that is not one', async () => {
    const { board, author } = await setup();
    const deletedId = await createPhoto(author, board, { deleted_at: day(0) });
    const albumId = await createAlbum(author, board);

    for (const id of [999999, deletedId, albumId]) {
      const response = await get(`/api/photo/${id}`, author);
      expect(response.status).toBe(404);
    }
  });
});

describe('GET /api/photo/list', () => {
  it('returns the photos newest first, with a total count', async () => {
    const { board, author } = await setup();
    const tag = await createTag(board);
    const older = await createPhoto(author, board, { created_at: day(1) });
    const newer = await createPhoto(author, board, { created_at: day(2) });
    await createPhoto(author, board, {
      created_at: day(3),
      deleted_at: day(3),
    });
    await tagContent(newer, [tag.tag_id]);

    const response = await get('/api/photo/list', author);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      count: 2,
      rows: [
        {
          ...contentJson(newer, author, board),
          photo: photoJson(newer),
          user: { nickname: author.nickname },
          board: { board_id: board.board_id, board_name: board.board_name },
          tags: [
            {
              ...tagJson(tag, board),
              contentTag: { content_id: newer, tag_id: tag.tag_id },
            },
          ],
        },
        {
          ...contentJson(older, author, board),
          photo: photoJson(older),
          user: { nickname: author.nickname },
          board: { board_id: board.board_id, board_name: board.board_name },
          tags: [],
        },
      ],
    });
  });

  it('pages with limit and offset, and filters by board and author', async () => {
    const { board, author } = await setup();
    const otherBoard = await createBoard({ lv_read: 10 });
    const someoneElse = await createUser({ grade: 8 });
    const ids = [];
    for (let n = 0; n < 4; n += 1) {
      ids.push(await createPhoto(author, board, { created_at: day(n) }));
    }
    await createPhoto(author, otherBoard, { created_at: day(9) });
    await createPhoto(someoneElse, board, { created_at: day(9) });

    const response = await get(
      `/api/photo/list?board_id=${board.board_id}&user_uuid=${author.user_uuid}&limit=2&offset=1`,
      author,
    );

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(4);
    expect(
      response.body.rows.map((row: { content_id: number }) => row.content_id),
    ).toEqual([ids[2], ids[1]]);
  });

  it('leaves out boards above the reader grade', async () => {
    const { board, author } = await setup();
    const staffBoard = await createBoard({ lv_read: 6 });
    const visible = await createPhoto(author, board);
    await createPhoto(author, staffBoard);

    const response = await get('/api/photo/list', author);

    expect(response.body.count).toBe(1);
    expect(response.body.rows[0].content_id).toBe(visible);
  });

  it('filters by any of the tags the web sends, and lists only those tags', async () => {
    const { board, author } = await setup();
    const [first, second, other] = [
      await createTag(board),
      await createTag(board),
      await createTag(board),
    ];
    const both = await createPhoto(author, board, { created_at: day(2) });
    const one = await createPhoto(author, board, { created_at: day(1) });
    const none = await createPhoto(author, board, { created_at: day(0) });
    await tagContent(both, [first.tag_id, second.tag_id, other.tag_id]);
    await tagContent(one, [second.tag_id]);
    await tagContent(none, [other.tag_id]);

    // axios writes an array param as `tags[]=a&tags[]=b`.
    const response = await get(
      `/api/photo/list?tags[]=${first.tag_id}&tags[]=${second.tag_id}`,
      author,
    );

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(2);
    expect(
      response.body.rows.map(
        (row: { content_id: number; tags: { tag_id: string }[] }) => [
          row.content_id,
          row.tags.map((tag) => tag.tag_id).sort(),
        ],
      ),
    ).toEqual([
      [both, [first.tag_id, second.tag_id].sort()],
      [one, [second.tag_id]],
    ]);

    const single = await get(`/api/photo/list?tags=${other.tag_id}`, author);
    expect(single.body.count).toBe(2);
  });

  it('searches the title, the text or the author nickname', async () => {
    const { board, author } = await setup();
    const someoneElse = await createUser({ grade: 8 });
    const titled = await createPhoto(author, board, {
      title: 'Orion nebula',
      created_at: day(2),
    });
    const texted = await createPhoto(author, board, {
      text: 'near Orion',
      created_at: day(1),
    });
    const byOther = await createPhoto(someoneElse, board, {
      created_at: day(0),
    });

    const search = async (type: string, keyword: string) => {
      const response = await get(
        `/api/photo/list?search_type=${type}&search_keyword=${encodeURIComponent(keyword)}`,
        author,
      );
      return response.body.rows.map(
        (row: { content_id: number }) => row.content_id,
      );
    };

    expect(await search('title', 'Orion')).toEqual([titled]);
    expect(await search('text', 'Orion')).toEqual([texted]);
    expect(await search('all', 'Orion')).toEqual([titled, texted]);
    expect(await search('user', someoneElse.nickname)).toEqual([byOther]);
  });

  it('returns 404 for an unknown user_uuid', async () => {
    const { author } = await setup();

    const response = await get(
      '/api/photo/list?user_uuid=00000000-0000-4000-8000-000000000000',
      author,
    );

    expect(response.status).toBe(404);
  });
});

describe('GET /api/photoboard/:board_id/albums', () => {
  it('returns 12 albums a page, newest first, with cover, latest photo, author and category', async () => {
    const { board, author } = await setup();
    const { category_id } = await createCategory(board);
    const albumId = await createAlbum(author, board, {
      category_id,
      created_at: day(20),
    });
    const cover = await createPhoto(author, board, {
      parent_id: albumId,
      photo: { camera: 'EOS' },
    });
    const latest = await createPhoto(author, board, { parent_id: albumId });
    await createPhoto(author, board, {
      parent_id: albumId,
      deleted_at: day(0),
    });
    await createAlbum(author, board, {
      created_at: day(21),
      deleted_at: day(21),
    });
    for (let n = 0; n < 12; n += 1) {
      await createAlbum(author, board, { created_at: day(n) });
    }
    await createAlbum(author, await createBoard({ lv_read: 10 }));
    // The cover is set after the photos exist, as the web does.
    const coverAlbum = await createAlbum(author, board, {
      created_at: day(30),
      tn_photo_id: cover,
    });

    const response = await get(
      `/api/photoboard/${board.board_id}/albums`,
      author,
    );

    expect(response.status).toBe(200);
    expect(response.body.albumCount).toBe(14);
    expect(response.body.albumInfo).toHaveLength(12);
    const [first, second] = response.body.albumInfo;
    expect(first).toEqual({
      ...contentJson(coverAlbum, author, board, { type: 'AL' }),
      album: {
        content_id: coverAlbum,
        is_private: false,
        tn_photo_id: cover,
        thumbnail: {
          ...contentJson(cover, author, board, { parent_id: albumId }),
          photo: photoJson(cover, { camera: 'EOS' }),
        },
      },
      user: detailUserJson(author),
      category: null,
      children: [],
    });
    expect(second).toEqual({
      ...contentJson(albumId, author, board, { type: 'AL', category_id }),
      album: {
        content_id: albumId,
        is_private: false,
        tn_photo_id: null,
        thumbnail: null,
      },
      user: detailUserJson(author),
      category: {
        category_id,
        board_id: board.board_id,
        category_name: expect.any(String),
        category_color: null,
      },
      children: [
        {
          ...contentJson(latest, author, board, { parent_id: albumId }),
          photo: photoJson(latest),
        },
      ],
    });

    const page2 = await get(
      `/api/photoboard/${board.board_id}/albums?page=2`,
      author,
    );
    expect(page2.body.albumCount).toBe(14);
    expect(page2.body.albumInfo).toHaveLength(2);
  });

  it('filters by category and searches title, text or nickname', async () => {
    const { board, author } = await setup();
    const someoneElse = await createUser({ grade: 8 });
    const { category_id } = await createCategory(board);
    const inCategory = await createAlbum(author, board, {
      category_id,
      title: 'Lunar eclipse',
      created_at: day(2),
    });
    const texted = await createAlbum(author, board, {
      text: 'eclipse night',
      created_at: day(1),
    });
    const byOther = await createAlbum(someoneElse, board, {
      created_at: day(0),
    });

    const list = async (query: string) => {
      const response = await get(
        `/api/photoboard/${board.board_id}/albums?${query}`,
        author,
      );
      return [
        response.body.albumCount,
        response.body.albumInfo.map(
          (row: { content_id: number }) => row.content_id,
        ),
      ];
    };

    expect(await list(`category=${category_id}`)).toEqual([1, [inCategory]]);
    expect(await list('search_type=title&search_keyword=night')).toEqual([
      0,
      [],
    ]);
    expect(await list('search_type=title&search_keyword=Lunar')).toEqual([
      1,
      [inCategory],
    ]);
    expect(await list('search_type=all&search_keyword=eclipse')).toEqual([
      2,
      [inCategory, texted],
    ]);
    expect(
      await list(`search_type=user&search_keyword=${someoneElse.nickname}`),
    ).toEqual([1, [byOther]]);
  });
});

describe('album and photo reads after the move', () => {
  it('returns 404 for a non-numeric id', async () => {
    const { author } = await setup();

    for (const path of [
      '/api/album/abc',
      '/api/album/abc/photos',
      '/api/photo/abc',
    ]) {
      const response = await get(path, author);
      expect(response.status).toBe(404);
    }
  });

  it("GET /api/album/:album_id/photos checks the album's board read level", async () => {
    const staffBoard = await createBoard({ lv_read: 6 });
    const staff = await createUser({ grade: 6 });
    const albumId = await createAlbum(staff, staffBoard);
    await createPhoto(staff, staffBoard, { parent_id: albumId });
    const member = await createUser({ grade: 8 });

    const response = await get(`/api/album/${albumId}/photos`, member);

    expect(response.status).toBe(403);
  });

  it('GET /api/album/:album_id/photos returns 404 for a missing album', async () => {
    const { author } = await setup();

    const response = await get('/api/album/999999/photos', author);

    expect(response.status).toBe(404);
  });

  it("steps through a photo without an album only on that photo's board", async () => {
    const { board, author } = await setup();
    const staffBoard = await createBoard({ lv_read: 6 });
    await createPhoto(author, staffBoard);
    const prev = await createPhoto(author, board);
    await createPhoto(author, staffBoard);
    const photoId = await createPhoto(author, board);
    await createPhoto(author, staffBoard);

    const response = await get(`/api/photo/${photoId}`, author);

    expect(response.status).toBe(200);
    expect(response.body.prevPhoto).toMatchObject({ content_id: prev });
    expect(response.body.nextPhoto).toBeNull();
  });

  it('GET /api/photoboard/:board_id/photos is gone', async () => {
    const { board } = await setup();

    const response = await api().get(
      `/api/photoboard/${board.board_id}/photos`,
    );

    expect(response.status).toBe(404);
  });

  it('POST /api/photo/migrate is gone', async () => {
    const { author } = await setup();

    const response = await api()
      .post('/api/photo/migrate')
      .set('Authorization', bearer(author));

    expect(response.status).toBe(404);
  });
});
