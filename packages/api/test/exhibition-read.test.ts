import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import {
  bearer,
  createBoard,
  createContentLike,
  createExhibitPhoto,
  createExhibition,
  createPost,
  createUser,
  type Board,
  type User,
} from './helpers/factories';
import { contentState, softDeleteUser } from './helpers/db';

/*
 * The JSON the web reads from the exhibition read endpoints, kept as the
 * Sequelize version answered it (camelCase timestamps, the photographer
 * nested in `exhibitPhoto`, the poster's legacy path columns, ...).
 */

const DAY = 24 * 60 * 60 * 1000;
const BASE = new Date('2024-03-01T10:00:00.000Z').getTime();
const day = (n: number) => new Date(BASE + n * DAY);

async function setup() {
  const board = await createBoard({ lv_read: 10, lv_write: 9, lv_edit: 1 });
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
    type: 'EH',
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

function exhibitionJson(
  contentId: number,
  overrides: Record<string, unknown> = {},
) {
  return {
    content_id: contentId,
    exhibition_no: expect.any(Number),
    slogan: expect.any(String),
    date_start: '2024-03-01T00:00:00.000Z',
    date_end: '2024-03-08T00:00:00.000Z',
    place: expect.any(String),
    poster_path: expect.any(String),
    poster_thumbnail_path: expect.any(String),
    poster_url: expect.any(String),
    poster_thumbnail_url: expect.any(String),
    ...overrides,
  };
}

function exhibitPhotoJson(
  contentId: number,
  overrides: Record<string, unknown> = {},
) {
  return {
    content_id: contentId,
    order: expect.any(Number),
    photographer_id: null,
    photographer_alt: null,
    file_path: expect.any(String),
    thumbnail_path: expect.any(String),
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

function userJson(user: User, overrides: Record<string, unknown> = {}) {
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

describe('GET /api/exhibition/:exhibition_id', () => {
  it('returns the exhibition with its author and board', async () => {
    const { board, author } = await setup();
    const exhibitionId = await createExhibition(author, board, {
      title: '41st',
      view_num: 2,
      exhibition: { exhibition_no: 41, slogan: 'Look up' },
    });

    const response = await get(`/api/exhibition/${exhibitionId}`, author);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      exhibitionInfo: {
        ...contentJson(exhibitionId, author, board, {
          title: '41st',
          view_num: 2,
        }),
        exhibition: exhibitionJson(exhibitionId, {
          exhibition_no: 41,
          slogan: 'Look up',
        }),
        user: userJson(author),
        board: {
          board_id: board.board_id,
          board_name: board.board_name,
          lv_read: 10,
          lv_write: 9,
        },
      },
    });
    expect((await contentState(exhibitionId)).view_num).toBe(2);
  });

  it('shows the author after they left the club', async () => {
    const { board, author } = await setup();
    const exhibitionId = await createExhibition(author, board);
    await softDeleteUser(author);
    const reader = await createUser({ grade: 8 });

    const response = await get(`/api/exhibition/${exhibitionId}`, reader);

    expect(response.body.exhibitionInfo.user).toEqual(
      userJson(author, { deleted_at: expect.any(String) }),
    );
  });
});

describe('GET /api/exhibition/:exhibition_id/exhibitPhotos', () => {
  it('returns the photos by order, then oldest first, without deleted ones', async () => {
    const { board, author } = await setup();
    const exhibitionId = await createExhibition(author, board);
    const second = await createExhibitPhoto(author, board, {
      parent_id: exhibitionId,
      created_at: day(1),
      exhibitPhoto: { order: 1, photographer_alt: 'Kim' },
    });
    const first = await createExhibitPhoto(author, board, {
      parent_id: exhibitionId,
      created_at: day(0),
      exhibitPhoto: { order: 1, camera: 'EOS' },
    });
    const last = await createExhibitPhoto(author, board, {
      parent_id: exhibitionId,
      exhibitPhoto: { order: 2 },
    });
    await createExhibitPhoto(author, board, {
      parent_id: exhibitionId,
      deleted_at: day(0),
      exhibitPhoto: { order: 0 },
    });
    await createExhibitPhoto(author, board);

    const response = await get(
      `/api/exhibition/${exhibitionId}/exhibitPhotos`,
      author,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      exhibitPhotosInfo: [
        {
          ...contentJson(first, author, board, {
            type: 'EP',
            parent_id: exhibitionId,
          }),
          exhibitPhoto: exhibitPhotoJson(first, { order: 1, camera: 'EOS' }),
        },
        {
          ...contentJson(second, author, board, {
            type: 'EP',
            parent_id: exhibitionId,
          }),
          exhibitPhoto: exhibitPhotoJson(second, {
            order: 1,
            photographer_alt: 'Kim',
          }),
        },
        {
          ...contentJson(last, author, board, {
            type: 'EP',
            parent_id: exhibitionId,
          }),
          exhibitPhoto: exhibitPhotoJson(last, { order: 2 }),
        },
      ],
    });
  });
});

describe('GET /api/exhibitPhoto/:exhibitPhoto_id', () => {
  it('returns the photo with its photographer, exhibition, author and the exhibition photos', async () => {
    const { board, author } = await setup();
    const photographer = await createUser({ grade: 8 });
    const exhibitionId = await createExhibition(author, board, {
      exhibition: { exhibition_no: 41 },
    });
    const photoId = await createExhibitPhoto(author, board, {
      parent_id: exhibitionId,
      view_num: 4,
      exhibitPhoto: {
        order: 1,
        photographer_id: photographer.user_id,
        location: 'Seoul',
      },
    });
    const other = await createExhibitPhoto(author, board, {
      parent_id: exhibitionId,
      exhibitPhoto: { order: 2 },
    });
    await createContentLike(author, photoId);

    const response = await get(`/api/exhibitPhoto/${photoId}`, author);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      exhibitPhotoInfo: {
        ...contentJson(photoId, author, board, {
          type: 'EP',
          parent_id: exhibitionId,
          view_num: 4,
        }),
        exhibitPhoto: {
          ...exhibitPhotoJson(photoId, {
            order: 1,
            photographer_id: photographer.user_id,
            location: 'Seoul',
          }),
          photographer: userJson(photographer),
        },
        parent: {
          ...contentJson(exhibitionId, author, board),
          exhibition: exhibitionJson(exhibitionId, { exhibition_no: 41 }),
        },
        user: userJson(author),
      },
      likeInfo: true,
      exhibitPhotosInfo: [
        expect.objectContaining({
          content_id: photoId,
          exhibitPhoto: exhibitPhotoJson(photoId, {
            order: 1,
            photographer_id: photographer.user_id,
            location: 'Seoul',
          }),
        }),
        expect.objectContaining({
          content_id: other,
          exhibitPhoto: exhibitPhotoJson(other, { order: 2 }),
        }),
      ],
    });
    expect((await contentState(photoId)).view_num).toBe(5);
  });

  it('shows no photographer for a typed name, and no parent once the exhibition is deleted', async () => {
    const { board, author } = await setup();
    const exhibitionId = await createExhibition(author, board, {
      deleted_at: day(0),
    });
    const photoId = await createExhibitPhoto(author, board, {
      parent_id: exhibitionId,
      exhibitPhoto: { photographer_alt: 'Kim' },
    });

    const response = await get(`/api/exhibitPhoto/${photoId}`, author);

    expect(response.status).toBe(200);
    expect(response.body.exhibitPhotoInfo.exhibitPhoto).toMatchObject({
      photographer_alt: 'Kim',
      photographer: null,
    });
    expect(response.body.exhibitPhotoInfo.parent).toBeNull();
  });
});

describe('GET /api/board/:board_id/exhibitions', () => {
  it('returns every exhibition, newest number first, without deleted ones', async () => {
    const { board, author } = await setup();
    const otherBoard = await createBoard({ lv_read: 10 });
    const older = await createExhibition(author, board, {
      exhibition: { exhibition_no: 40 },
    });
    const newer = await createExhibition(author, board, {
      exhibition: { exhibition_no: 41 },
    });
    // Like the Sequelize query, it doesn't filter by board.
    const elsewhere = await createExhibition(author, otherBoard, {
      exhibition: { exhibition_no: 39 },
    });
    await createExhibition(author, board, {
      deleted_at: day(0),
      exhibition: { exhibition_no: 42 },
    });

    const response = await get(
      `/api/board/${board.board_id}/exhibitions`,
      author,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        ...contentJson(newer, author, board),
        exhibition: exhibitionJson(newer, { exhibition_no: 41 }),
        user: userJson(author),
        board: {
          board_id: board.board_id,
          board_name: board.board_name,
          lv_read: 10,
        },
      },
      expect.objectContaining({ content_id: older }),
      expect.objectContaining({ content_id: elsewhere }),
    ]);
  });
});

describe('exhibition reads after the move', () => {
  it('checks the board read level', async () => {
    const staffBoard = await createBoard({ lv_read: 6 });
    const staff = await createUser({ grade: 6 });
    const exhibitionId = await createExhibition(staff, staffBoard);
    const photoId = await createExhibitPhoto(staff, staffBoard, {
      parent_id: exhibitionId,
    });
    const member = await createUser({ grade: 8 });

    for (const path of [
      `/api/exhibition/${exhibitionId}`,
      `/api/exhibition/${exhibitionId}/exhibitPhotos`,
      `/api/exhibitPhoto/${photoId}`,
    ]) {
      const response = await get(path, member);
      expect(response.status).toBe(403);
    }
    expect((await contentState(photoId)).view_num).toBe(0);
  });

  it('returns 404 for a missing, deleted or non-numeric id, or a content of another type', async () => {
    const { board, author } = await setup();
    const deletedExhibition = await createExhibition(author, board, {
      deleted_at: day(0),
    });
    const deletedPhoto = await createExhibitPhoto(author, board, {
      deleted_at: day(0),
    });
    const postId = await createPost(author, board);

    for (const id of [999999, deletedExhibition, postId, 'abc']) {
      expect((await get(`/api/exhibition/${id}`, author)).status).toBe(404);
      expect(
        (await get(`/api/exhibition/${id}/exhibitPhotos`, author)).status,
      ).toBe(404);
    }
    for (const id of [999999, deletedPhoto, postId, 'abc']) {
      expect((await get(`/api/exhibitPhoto/${id}`, author)).status).toBe(404);
    }
  });
});
