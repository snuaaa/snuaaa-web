import { beforeAll, describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import {
  bearer,
  createBoard,
  createExhibitPhoto,
  createExhibition,
  createPost,
  createUser,
} from './helpers/factories';
import {
  boardContents,
  childContents,
  contentState,
  countContents,
  exhibitPhotoRow,
  exhibitionRow,
  withFailingWrites,
} from './helpers/db';
import { jpegImage, largeJpegImage } from './helpers/files';

/*
 * The exhibition and exhibit photo writes, with the exact bodies the web
 * sends (`ExhibitionService`, `ExhibitPhotoService`): multipart forms whose
 * dates come from `Date.prototype.toString()`, and an exhibit photo's
 * details as a JSON string in `photoInfo`.
 */

const NOT_FOUND = {
  success: false,
  error: 'NOT_FOUND',
  message: 'Content not found',
};

const FORBIDDEN = {
  success: false,
  error: 'FORBIDDEN',
  message: 'Permission denied',
  code: 4001,
};

/** An S3 URL that `uploadImageToS3` returns for the resource type. */
const s3Url = (resourceType: string) =>
  expect.stringMatching(
    new RegExp(
      `^https://snuaaa-test\\.s3\\.ap-northeast-2\\.amazonaws\\.com/image/${resourceType}/\\d{8}/[0-9a-f-]{36}$`,
    ),
  );

// What `new Date(...).toString()` gives in a browser in Korea.
const START = 'Fri Mar 01 2024 00:00:00 GMT+0900 (Korean Standard Time)';
const END = 'Fri Mar 08 2024 00:00:00 GMT+0900 (Korean Standard Time)';

let image: Buffer;
beforeAll(async () => {
  image = await jpegImage();
});

async function setup() {
  const board = await createBoard({ lv_read: 10, lv_write: 9, lv_edit: 1 });
  const author = await createUser({ grade: 8 });
  return { board, author };
}

describe('POST /api/board/:board_id/exhibition', () => {
  const create = (boardId: string, token: string) =>
    api()
      .post(`/api/board/${boardId}/exhibition`)
      .set('Authorization', token)
      .field('title', '41st exhibition')
      .field('text', 'about it')
      .field('exhibition_no', '41')
      .field('slogan', 'Look up')
      .field('date_start', START)
      .field('date_end', END)
      .field('place', 'Student hall');

  it('creates the exhibition with its poster on S3', async () => {
    const { board, author } = await setup();

    const response = await create(board.board_id, bearer(author)).attach(
      'poster',
      image,
      'poster.jpg',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    const [content] = await boardContents(board.board_id);
    expect(content).toMatchObject({
      type: 'EH',
      author_id: author.user_id,
      title: '41st exhibition',
      text: 'about it',
      category_id: null,
      deleted_at: null,
    });
    expect(content.content_uuid).toEqual(expect.any(String));
    const row = await exhibitionRow(content.content_id);
    expect(row).toEqual({
      exhibition_no: 41,
      slogan: 'Look up',
      date_start: new Date('2024-02-29T15:00:00.000Z'),
      date_end: new Date('2024-03-07T15:00:00.000Z'),
      place: 'Student hall',
      poster_path: s3Url('exhibition'),
      poster_thumbnail_path: s3Url('exhibition'),
      poster_url: s3Url('exhibition'),
      poster_thumbnail_url: s3Url('exhibition'),
    });
    // The legacy path columns hold the same URLs.
    expect(row.poster_path).toBe(row.poster_url);
    expect(row.poster_thumbnail_path).toBe(row.poster_thumbnail_url);
    expect(row.poster_url).not.toBe(row.poster_thumbnail_url);
  });

  it('rejects a request without a poster with 400', async () => {
    const { board, author } = await setup();

    const response = await create(board.board_id, bearer(author));

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: 'BAD_REQUEST',
    });
    expect(await countContents({ board_id: board.board_id })).toBe(0);
  });

  it('accepts a poster larger than the 100KB a JSON body may be', async () => {
    const { board, author } = await setup();
    const poster = await largeJpegImage();
    expect(poster.length).toBeGreaterThan(200 * 1024);

    const response = await create(board.board_id, bearer(author)).attach(
      'poster',
      poster,
      'poster.jpg',
    );

    expect(response.status).toBe(200);
    expect(await countContents({ board_id: board.board_id })).toBe(1);
  });

  it('returns 404 for an unknown board', async () => {
    const { author } = await setup();

    const response = await create('b_missing', bearer(author)).attach(
      'poster',
      image,
      'poster.jpg',
    );

    expect(response.status).toBe(404);
  });
});

describe('PATCH /api/exhibition/:exhibition_id', () => {
  const update = (exhibitionId: number, token: string) =>
    api()
      .patch(`/api/exhibition/${exhibitionId}`)
      .set('Authorization', token)
      .field('text', 'new text')
      .field('exhibition_no', '42')
      .field('slogan', 'New slogan')
      .field('date_start', START)
      .field('date_end', END)
      .field('place', 'New place');

  it('changes the details and keeps the poster without a new file', async () => {
    const { board, author } = await setup();
    const exhibitionId = await createExhibition(author, board, {
      title: 'kept title',
    });
    const before = await exhibitionRow(exhibitionId);

    const response = await update(exhibitionId, bearer(author));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect(await contentState(exhibitionId)).toMatchObject({
      title: 'kept title',
      text: 'new text',
    });
    expect(await exhibitionRow(exhibitionId)).toEqual({
      ...before,
      exhibition_no: 42,
      slogan: 'New slogan',
      date_start: new Date('2024-02-29T15:00:00.000Z'),
      date_end: new Date('2024-03-07T15:00:00.000Z'),
      place: 'New place',
    });
  });

  it('replaces the poster when a new file comes', async () => {
    const { board, author } = await setup();
    const exhibitionId = await createExhibition(author, board);

    const response = await update(exhibitionId, bearer(author)).attach(
      'poster',
      image,
      'poster.jpg',
    );

    expect(response.status).toBe(200);
    expect(await exhibitionRow(exhibitionId)).toMatchObject({
      poster_path: s3Url('exhibition'),
      poster_thumbnail_path: s3Url('exhibition'),
      poster_url: s3Url('exhibition'),
      poster_thumbnail_url: s3Url('exhibition'),
    });
  });

  it('lets a grade within lv_edit change it, and rejects other members with 403', async () => {
    const { board, author } = await setup();
    const exhibitionId = await createExhibition(author, board);
    const admin = await createUser({ grade: 1 });
    const member = await createUser({ grade: 8 });

    expect((await update(exhibitionId, bearer(admin))).status).toBe(200);
    const response = await update(exhibitionId, bearer(member));
    expect(response.status).toBe(403);
    expect(response.body).toEqual(FORBIDDEN);
  });

  it('rejects an exhibition_no or date that is not one with 400', async () => {
    const { board, author } = await setup();
    const exhibitionId = await createExhibition(author, board);
    const before = await exhibitionRow(exhibitionId);

    for (const [field, value] of [
      ['exhibition_no', 'abc'],
      ['exhibition_no', '0'],
      ['date_start', 'someday'],
    ]) {
      const response = await api()
        .patch(`/api/exhibition/${exhibitionId}`)
        .set('Authorization', bearer(author))
        .field(field, value);
      expect(response.status).toBe(400);
    }
    expect(await exhibitionRow(exhibitionId)).toEqual(before);
  });

  it('returns 404 for a missing or deleted exhibition, or a content that is not one', async () => {
    const { board, author } = await setup();
    const deletedId = await createExhibition(author, board, {
      deleted_at: new Date(),
    });
    const postId = await createPost(author, board);

    for (const id of [999999, deletedId, postId]) {
      const response = await update(id, bearer(author));
      expect(response.status).toBe(404);
      expect(response.body).toEqual(NOT_FOUND);
    }
  });
});

describe('DELETE /api/exhibition/:exhibition_id', () => {
  it('soft-deletes the exhibition and keeps its photos', async () => {
    const { board, author } = await setup();
    const exhibitionId = await createExhibition(author, board);
    const photoId = await createExhibitPhoto(author, board, {
      parent_id: exhibitionId,
    });

    const response = await api()
      .delete(`/api/exhibition/${exhibitionId}`)
      .set('Authorization', bearer(author));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect((await contentState(exhibitionId)).deleted_at).not.toBeNull();
    expect(await exhibitionRow(exhibitionId)).toBeDefined();
    expect((await contentState(photoId)).deleted_at).toBeNull();
  });

  it('rejects another member with 403 and returns 404 for a post', async () => {
    const { board, author } = await setup();
    const exhibitionId = await createExhibition(author, board);
    const postId = await createPost(author, board);
    const member = await createUser({ grade: 8 });

    const forbidden = await api()
      .delete(`/api/exhibition/${exhibitionId}`)
      .set('Authorization', bearer(member));
    const notFound = await api()
      .delete(`/api/exhibition/${postId}`)
      .set('Authorization', bearer(author));

    expect(forbidden.status).toBe(403);
    expect(notFound.status).toBe(404);
    expect((await contentState(exhibitionId)).deleted_at).toBeNull();
    expect((await contentState(postId)).deleted_at).toBeNull();
  });
});

describe('POST /api/exhibition/:exhibition_id/exhibitPhoto', () => {
  async function exhibitionSetup() {
    const { board, author } = await setup();
    const exhibitionId = await createExhibition(author, board, {
      exhibition: { exhibition_no: 41 },
    });
    return { board, author, exhibitionId };
  }

  const upload = (
    exhibitionId: number,
    boardId: string,
    token: string,
    photoInfo: Record<string, unknown>,
  ) =>
    api()
      .post(`/api/exhibition/${exhibitionId}/exhibitPhoto`)
      .set('Authorization', token)
      .field('board_id', boardId)
      .field('photoInfo', JSON.stringify(photoInfo))
      .field('exhibition_no', '41');

  it('adds the photo to the exhibition, credited to a member', async () => {
    const { board, author, exhibitionId } = await exhibitionSetup();
    const photographer = await createUser({ grade: 8 });

    const response = await upload(
      exhibitionId,
      board.board_id,
      bearer(author),
      {
        title: 'Orion',
        text: 'winter',
        order: 3,
        photographer: {
          nickname: photographer.nickname,
          profile_path: null,
          user_uuid: photographer.user_uuid,
        },
        location: 'Seoul',
        camera: 'EOS',
        lens: '50mm',
        exposure_time: '30s',
        focal_length: '50',
        f_stop: '1.8',
        iso: '1600',
        date: '2024-01-05T12:00:00.000Z',
      },
    ).attach('exhibitPhoto', image, 'orion.jpg');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    const [content] = await childContents(exhibitionId, 'EP');
    expect(content).toMatchObject({
      author_id: author.user_id,
      board_id: board.board_id,
      category_id: null,
      title: 'Orion',
      text: 'winter',
      deleted_at: null,
    });
    expect(content.content_uuid).toEqual(expect.any(String));
    const row = await exhibitPhotoRow(content.content_id);
    expect(row).toEqual({
      exhibition_id: null,
      order: 3,
      photographer_id: photographer.user_id,
      photographer_alt: null,
      file_path: s3Url('exhibit-photo'),
      thumbnail_path: s3Url('exhibit-photo'),
      img_url: s3Url('exhibit-photo'),
      thumbnail_url: s3Url('exhibit-photo'),
      location: 'Seoul',
      camera: 'EOS',
      lens: '50mm',
      exposure_time: '30s',
      focal_length: '50',
      f_stop: '1.8',
      iso: '1600',
      date: new Date('2024-01-05T12:00:00.000Z'),
    });
    expect(row.file_path).toBe(row.img_url);
    expect(row.thumbnail_path).toBe(row.thumbnail_url);
  });

  it('credits the typed name when the member is unknown', async () => {
    const { board, author, exhibitionId } = await exhibitionSetup();

    const response = await upload(
      exhibitionId,
      board.board_id,
      bearer(author),
      {
        title: 'Moon',
        text: '',
        order: 1,
        photographer: {
          nickname: 'gone',
          user_uuid: '00000000-0000-4000-8000-000000000000',
        },
        photographer_alt: 'Kim',
      },
    ).attach('exhibitPhoto', image, 'moon.jpg');

    expect(response.status).toBe(200);
    const [content] = await childContents(exhibitionId, 'EP');
    expect(await exhibitPhotoRow(content.content_id)).toMatchObject({
      photographer_id: null,
      photographer_alt: 'Kim',
      location: null,
      date: null,
    });
  });

  it('rejects a request without a file with 400', async () => {
    const { board, author, exhibitionId } = await exhibitionSetup();

    const response = await upload(
      exhibitionId,
      board.board_id,
      bearer(author),
      {
        title: 'no file',
        order: 1,
      },
    );

    expect(response.status).toBe(400);
    expect(await childContents(exhibitionId, 'EP')).toEqual([]);
  });

  it('returns 404 for a parent that is not an exhibition', async () => {
    const { board, author } = await setup();
    const postId = await createPost(author, board);

    const response = await upload(postId, board.board_id, bearer(author), {
      title: 'x',
      order: 1,
    }).attach('exhibitPhoto', image, 'x.jpg');

    expect(response.status).toBe(404);
    expect(await childContents(postId, 'EP')).toEqual([]);
  });
});

describe('PATCH /api/exhibitPhoto/:exhibitPhoto_id', () => {
  async function photoSetup() {
    const { board, author } = await setup();
    const exhibitionId = await createExhibition(author, board);
    const photoId = await createExhibitPhoto(author, board, {
      parent_id: exhibitionId,
      title: 'old',
      text: 'old text',
      exhibitPhoto: {
        order: 1,
        photographer_alt: 'Kim',
        location: 'Busan',
        camera: 'old cam',
        date: new Date('2023-01-01T00:00:00.000Z'),
      },
    });
    return { board, author, photoId };
  }

  it("changes the photo's details, crediting a member", async () => {
    const { author, photoId } = await photoSetup();
    const photographer = await createUser({ grade: 8 });

    const response = await api()
      .patch(`/api/exhibitPhoto/${photoId}`)
      .set('Authorization', bearer(author))
      .send({
        title: 'new',
        text: 'new text',
        order: 5,
        photographer: {
          nickname: photographer.nickname,
          profile_path: null,
          user_uuid: photographer.user_uuid,
        },
        camera: 'new cam',
        date: '2024-02-02T00:00:00.000Z',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect(await contentState(photoId)).toMatchObject({
      title: 'new',
      text: 'new text',
    });
    expect(await exhibitPhotoRow(photoId)).toMatchObject({
      order: 5,
      photographer_id: photographer.user_id,
      photographer_alt: null,
      camera: 'new cam',
      // A field the web leaves out stays as it is.
      location: 'Busan',
      date: new Date('2024-02-02T00:00:00.000Z'),
    });
  });

  it('credits the typed name, and clears the date when the web leaves it out', async () => {
    const { author, photoId } = await photoSetup();

    const response = await api()
      .patch(`/api/exhibitPhoto/${photoId}`)
      .set('Authorization', bearer(author))
      .send({ title: 'new', text: '', order: 2, photographer_alt: 'Lee' });

    expect(response.status).toBe(200);
    expect(await exhibitPhotoRow(photoId)).toMatchObject({
      order: 2,
      photographer_id: null,
      photographer_alt: 'Lee',
      date: null,
    });
  });

  it('rejects another member with 403 and returns 404 for an exhibition', async () => {
    const { board, author, photoId } = await photoSetup();
    const exhibitionId = await createExhibition(author, board);
    const member = await createUser({ grade: 8 });

    const forbidden = await api()
      .patch(`/api/exhibitPhoto/${photoId}`)
      .set('Authorization', bearer(member))
      .send({ title: 'x', order: 1 });
    const notFound = await api()
      .patch(`/api/exhibitPhoto/${exhibitionId}`)
      .set('Authorization', bearer(author))
      .send({ title: 'x', order: 1 });

    expect(forbidden.status).toBe(403);
    expect(notFound.status).toBe(404);
    expect(await contentState(photoId)).toMatchObject({ title: 'old' });
  });
});

describe('DELETE /api/exhibitPhoto/:exhibitPhoto_id', () => {
  it('removes the photo row and soft-deletes its content', async () => {
    const { board, author } = await setup();
    const exhibitionId = await createExhibition(author, board);
    const photoId = await createExhibitPhoto(author, board, {
      parent_id: exhibitionId,
    });

    const response = await api()
      .delete(`/api/exhibitPhoto/${photoId}`)
      .set('Authorization', bearer(author));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect((await contentState(photoId)).deleted_at).not.toBeNull();
    expect(await exhibitPhotoRow(photoId)).toBeUndefined();
  });

  it('rejects another member with 403', async () => {
    const { board, author } = await setup();
    const photoId = await createExhibitPhoto(author, board);
    const member = await createUser({ grade: 8 });

    const response = await api()
      .delete(`/api/exhibitPhoto/${photoId}`)
      .set('Authorization', bearer(member));

    expect(response.status).toBe(403);
    expect(await exhibitPhotoRow(photoId)).toBeDefined();
  });
});

describe('exhibition writes after the move', () => {
  it('credits the typed name when the web sends no member', async () => {
    const { board, author } = await setup();
    const exhibitionId = await createExhibition(author, board);

    // `photographer: undefined` disappears from the JSON the web sends.
    const response = await api()
      .post(`/api/exhibition/${exhibitionId}/exhibitPhoto`)
      .set('Authorization', bearer(author))
      .field('board_id', board.board_id)
      .field(
        'photoInfo',
        JSON.stringify({
          title: 'M42',
          text: '',
          order: 1,
          photographer_alt: 'Kim',
        }),
      )
      .field('exhibition_no', '41')
      .attach('exhibitPhoto', image, 'm42.jpg');

    expect(response.status).toBe(200);
    const [content] = await childContents(exhibitionId, 'EP');
    expect(await exhibitPhotoRow(content.content_id)).toMatchObject({
      photographer_id: null,
      photographer_alt: 'Kim',
    });
  });

  it('rejects photoInfo that is not the JSON the web sends with 400', async () => {
    const { board, author } = await setup();
    const exhibitionId = await createExhibition(author, board);

    for (const photoInfo of ['not json', '{"title":"x","order":"first"}']) {
      const response = await api()
        .post(`/api/exhibition/${exhibitionId}/exhibitPhoto`)
        .set('Authorization', bearer(author))
        .field('board_id', board.board_id)
        .field('photoInfo', photoInfo)
        .attach('exhibitPhoto', image, 'x.jpg');
      expect(response.status).toBe(400);
    }
    expect(await childContents(exhibitionId, 'EP')).toEqual([]);
  });

  it('rejects an exhibition with a bad exhibition_no or date with 400', async () => {
    const { board, author } = await setup();

    for (const [field, value] of [
      ['exhibition_no', 'abc'],
      ['date_start', 'someday'],
    ]) {
      const response = await api()
        .post(`/api/board/${board.board_id}/exhibition`)
        .set('Authorization', bearer(author))
        .field('title', 't')
        .field('exhibition_no', '41')
        .field('date_start', START)
        .field(field, value)
        .attach('poster', image, 'poster.jpg');
      expect(response.status).toBe(400);
    }
    expect(await countContents({ board_id: board.board_id })).toBe(0);
  });

  it('returns 404 for a non-numeric id', async () => {
    const { author } = await setup();

    for (const [method, path] of [
      ['patch', '/api/exhibition/abc'],
      ['delete', '/api/exhibition/abc'],
      ['patch', '/api/exhibitPhoto/abc'],
      ['delete', '/api/exhibitPhoto/abc'],
    ] as const) {
      const request = api()[method](path);
      const response = await request
        .set('Authorization', bearer(author))
        .send({ title: 'x', order: 1 });
      expect(response.status).toBe(404);
    }
  });

  it('keeps no exhibition when its detail row fails', async () => {
    const { board, author } = await setup();

    const response = await withFailingWrites('tb_exhibition', 'INSERT', () =>
      api()
        .post(`/api/board/${board.board_id}/exhibition`)
        .set('Authorization', bearer(author))
        .field('title', 't')
        .field('exhibition_no', '41')
        .attach('poster', image, 'poster.jpg'),
    );

    expect(response.status).toBe(500);
    expect(await countContents({ board_id: board.board_id })).toBe(0);
  });

  it('keeps no exhibit photo when its detail row fails', async () => {
    const { board, author } = await setup();
    const exhibitionId = await createExhibition(author, board);

    const response = await withFailingWrites('tb_exhibit_photo', 'INSERT', () =>
      api()
        .post(`/api/exhibition/${exhibitionId}/exhibitPhoto`)
        .set('Authorization', bearer(author))
        .field('board_id', board.board_id)
        .field('photoInfo', JSON.stringify({ title: 'x', order: 1 }))
        .attach('exhibitPhoto', image, 'x.jpg'),
    );

    expect(response.status).toBe(500);
    expect(await childContents(exhibitionId, 'EP')).toEqual([]);
  });

  it('leaves the exhibition unchanged when its detail row fails to update', async () => {
    const { board, author } = await setup();
    const exhibitionId = await createExhibition(author, board, {
      text: 'old',
    });

    const response = await withFailingWrites('tb_exhibition', 'UPDATE', () =>
      api()
        .patch(`/api/exhibition/${exhibitionId}`)
        .set('Authorization', bearer(author))
        .field('text', 'new')
        .field('slogan', 'new slogan'),
    );

    expect(response.status).toBe(500);
    expect((await contentState(exhibitionId)).text).toBe('old');
  });

  it('keeps the exhibit photo row when the soft delete fails', async () => {
    const { board, author } = await setup();
    const photoId = await createExhibitPhoto(author, board);

    const response = await withFailingWrites('tb_content', 'UPDATE', () =>
      api()
        .delete(`/api/exhibitPhoto/${photoId}`)
        .set('Authorization', bearer(author)),
    );

    expect(response.status).toBe(500);
    expect(await exhibitPhotoRow(photoId)).toBeDefined();
  });

  it('POST /api/exhibition/migrate and /api/exhibitPhoto/migrate are gone', async () => {
    const { author } = await setup();

    for (const path of [
      '/api/exhibition/migrate',
      '/api/exhibitPhoto/migrate',
    ]) {
      const response = await api()
        .post(path)
        .set('Authorization', bearer(author));
      expect(response.status).toBe(404);
    }
  });
});
