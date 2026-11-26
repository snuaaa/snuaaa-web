import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import {
  bearer,
  createAlbum,
  createBoard,
  createCategory,
  createPhoto,
  createPost,
  createTag,
  createUser,
  tagContent,
} from './helpers/factories';
import {
  albumRow,
  contentState,
  contentTagIds,
  countContents,
  photoRow,
  photosInAlbum,
  withFailingWrites,
} from './helpers/db';

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

async function setup() {
  const board = await createBoard({ lv_read: 10, lv_write: 10, lv_edit: 1 });
  const author = await createUser({ grade: 8 });
  const { category_id } = await createCategory(board);
  return { board, author, categoryId: category_id };
}

/** One photo as `PhotoUploader` sends it, after the image is on S3. */
function uploadedPhoto(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Orion',
    text: 'clear sky',
    date: '2024-01-05',
    location: 'Songdo',
    camera: 'EOS 6D',
    lens: '24-70mm',
    focal_length: '50',
    f_stop: '2.8',
    exposure_time: '30',
    iso: '1600',
    tags: [],
    img_url: 'https://bucket.example.com/orion.jpg',
    thumbnail_url: 'https://bucket.example.com/orion_thumb.jpg',
    ...overrides,
  };
}

describe('POST /api/photoboard/:board_id/album', () => {
  it('creates an album from the body the web sends', async () => {
    const { board, author, categoryId } = await setup();

    // `AlbumFormSheet.tsx`
    const response = await api()
      .post(`/api/photoboard/${board.board_id}/album`)
      .set('Authorization', bearer(author))
      .send({
        title: 'Star party',
        text: 'notes',
        category_id: categoryId,
        is_private: true,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect(await countContents({ board_id: board.board_id, type: 'AL' })).toBe(
      1,
    );
  });

  it('stores the album row with is_private', async () => {
    const { board, author } = await setup();

    for (const isPrivate of [true, false]) {
      await api()
        .post(`/api/photoboard/${board.board_id}/album`)
        .set('Authorization', bearer(author))
        .send({ title: `album ${isPrivate}`, text: '', is_private: isPrivate });
    }

    const read = await api()
      .get(`/api/photoboard/${board.board_id}/albums`)
      .set('Authorization', bearer(author));
    const byTitle = Object.fromEntries(
      read.body.albumInfo.map((album) => [album.title, album]),
    );
    for (const isPrivate of [true, false]) {
      const album = byTitle[`album ${isPrivate}`];
      expect(await contentState(album.content_id)).toMatchObject({
        type: 'AL',
        author_id: author.user_id,
        board_id: board.board_id,
        text: '',
        deleted_at: null,
      });
      expect(await albumRow(album.content_id)).toEqual({
        is_private: isPrivate,
        tn_photo_id: null,
      });
    }
  });

  it('returns 404 for an unknown board', async () => {
    const { author } = await setup();

    const response = await api()
      .post('/api/photoboard/b_missing/album')
      .set('Authorization', bearer(author))
      .send({ title: 'album', text: '' });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ success: false, error: 'NOT_FOUND' });
  });
});

describe('PATCH /api/album/:album_id', () => {
  it('changes the title, text, category and privacy from the body the web sends', async () => {
    const { board, author, categoryId } = await setup();
    const other = await createCategory(board);
    const updatedAt = new Date('2020-01-01T00:00:00Z');
    const albumId = await createAlbum(author, board, {
      category_id: categoryId,
      updated_at: updatedAt,
      is_private: false,
    });

    // `AlbumFormSheet.tsx` spreads the album it read, with its nested rows.
    const response = await api()
      .patch(`/api/album/${albumId}`)
      .set('Authorization', bearer(author))
      .send({
        content_id: albumId,
        board_id: board.board_id,
        title: 'renamed',
        text: 'new text',
        category_id: other.category_id,
        view_num: 3,
        board: { board_id: board.board_id, board_name: 'Photos' },
        user: { nickname: 'someone' },
        album: { is_private: true, tn_photo_id: null, thumbnail: null },
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    const state = await contentState(albumId);
    expect(state).toMatchObject({
      title: 'renamed',
      text: 'new text',
      category_id: other.category_id,
      view_num: 0,
    });
    expect(state.updated_at.getTime()).toBeGreaterThan(updatedAt.getTime());
    expect(await albumRow(albumId)).toEqual({
      is_private: true,
      tn_photo_id: null,
    });
  });

  it('leaves out fields the body does not give', async () => {
    const { board, author, categoryId } = await setup();
    const albumId = await createAlbum(author, board, {
      title: 'kept',
      category_id: categoryId,
      is_private: true,
    });

    const response = await api()
      .patch(`/api/album/${albumId}`)
      .set('Authorization', bearer(author))
      .send({ text: 'only text', album: {} });

    expect(response.status).toBe(200);
    expect(await contentState(albumId)).toMatchObject({
      title: 'kept',
      text: 'only text',
      category_id: categoryId,
    });
    expect((await albumRow(albumId)).is_private).toBe(true);
  });

  it('lets a grade within lv_edit edit, and nobody else', async () => {
    const { board, author } = await setup();
    const albumId = await createAlbum(author, board);
    const member = await createUser({ grade: 8 });
    const admin = await createUser({ grade: 1 });

    const denied = await api()
      .patch(`/api/album/${albumId}`)
      .set('Authorization', bearer(member))
      .send({ title: 'x', album: { is_private: true } });
    expect(denied.status).toBe(403);
    expect(denied.body).toEqual(FORBIDDEN);
    expect((await albumRow(albumId)).is_private).toBe(false);

    const allowed = await api()
      .patch(`/api/album/${albumId}`)
      .set('Authorization', bearer(admin))
      .send({ title: 'x', album: { is_private: true } });
    expect(allowed.status).toBe(200);
  });

  it('returns 404 for a post or a deleted album', async () => {
    const { board, author } = await setup();
    const postId = await createPost(author, board);
    const deletedId = await createAlbum(author, board, {
      deleted_at: new Date(),
    });

    for (const id of [postId, deletedId]) {
      const response = await api()
        .patch(`/api/album/${id}`)
        .set('Authorization', bearer(author))
        .send({ title: 'edited', album: {} });
      expect(response.status).toBe(404);
      expect(response.body).toEqual(NOT_FOUND);
    }
    expect((await contentState(postId)).title).not.toBe('edited');
  });
});

describe('PATCH /api/album/:album_id/thumbnail', () => {
  async function albumWithPhoto() {
    const { board, author } = await setup();
    const albumId = await createAlbum(author, board);
    const photographer = await createUser({ grade: 8 });
    const photoId = await createPhoto(photographer, board, {
      parent_id: albumId,
    });
    return { board, author, albumId, photographer, photoId };
  }

  it("lets the album's editor pick a photo in it", async () => {
    const { author, albumId, photoId } = await albumWithPhoto();

    const response = await api()
      .patch(`/api/album/${albumId}/thumbnail`)
      .set('Authorization', bearer(author))
      .send({ tn_photo_id: photoId });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect((await albumRow(albumId)).tn_photo_id).toBe(photoId);
  });

  it("lets a photo's author pick their own photo", async () => {
    const { albumId, photographer, photoId } = await albumWithPhoto();

    const response = await api()
      .patch(`/api/album/${albumId}/thumbnail`)
      .set('Authorization', bearer(photographer))
      .send({ tn_photo_id: photoId });

    expect(response.status).toBe(200);
    expect((await albumRow(albumId)).tn_photo_id).toBe(photoId);
  });

  it('rejects another member with 403', async () => {
    const { albumId, photoId } = await albumWithPhoto();
    const member = await createUser({ grade: 8 });

    const response = await api()
      .patch(`/api/album/${albumId}/thumbnail`)
      .set('Authorization', bearer(member))
      .send({ tn_photo_id: photoId });

    expect(response.status).toBe(403);
    expect(response.body).toEqual(FORBIDDEN);
    expect((await albumRow(albumId)).tn_photo_id).toBeNull();
  });

  it('returns 404 for a photo outside the album or a deleted one', async () => {
    const { board, author, albumId } = await albumWithPhoto();
    const elsewhere = await createPhoto(author, board);
    const deleted = await createPhoto(author, board, {
      parent_id: albumId,
      deleted_at: new Date(),
    });

    for (const photoId of [elsewhere, deleted, 999999]) {
      const response = await api()
        .patch(`/api/album/${albumId}/thumbnail`)
        .set('Authorization', bearer(author))
        .send({ tn_photo_id: photoId });
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        error: 'NOT_FOUND',
        message: 'Photo not found in album',
      });
    }
    expect((await albumRow(albumId)).tn_photo_id).toBeNull();
  });

  it("returns 404 to a photo's author once the album is deleted", async () => {
    const { author, albumId, photographer, photoId } = await albumWithPhoto();
    await api()
      .delete(`/api/album/${albumId}`)
      .set('Authorization', bearer(author));

    const response = await api()
      .patch(`/api/album/${albumId}/thumbnail`)
      .set('Authorization', bearer(photographer))
      .send({ tn_photo_id: photoId });

    expect(response.status).toBe(404);
    expect((await albumRow(albumId)).tn_photo_id).toBeNull();
  });

  it('returns 400 without tn_photo_id', async () => {
    const { author, albumId } = await albumWithPhoto();

    const response = await api()
      .patch(`/api/album/${albumId}/thumbnail`)
      .set('Authorization', bearer(author))
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: 'BAD_REQUEST',
    });
  });
});

describe('DELETE /api/album/:album_id', () => {
  it('soft-deletes the album, keeping its photos', async () => {
    const { board, author } = await setup();
    const albumId = await createAlbum(author, board);
    const photoId = await createPhoto(author, board, { parent_id: albumId });

    const response = await api()
      .delete(`/api/album/${albumId}`)
      .set('Authorization', bearer(author));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect((await contentState(albumId)).deleted_at).not.toBeNull();
    expect(await albumRow(albumId)).toBeDefined();
    expect((await contentState(photoId)).deleted_at).toBeNull();

    const again = await api()
      .delete(`/api/album/${albumId}`)
      .set('Authorization', bearer(author));
    expect(again.status).toBe(404);
    expect(again.body).toEqual(NOT_FOUND);
  });

  it('rejects another member with 403', async () => {
    const { board, author } = await setup();
    const albumId = await createAlbum(author, board);
    const member = await createUser({ grade: 8 });

    const response = await api()
      .delete(`/api/album/${albumId}`)
      .set('Authorization', bearer(member));

    expect(response.status).toBe(403);
    expect((await contentState(albumId)).deleted_at).toBeNull();
  });
});

describe('POST /api/photo', () => {
  it('creates the photos in the album from the body the web sends', async () => {
    const { board, author } = await setup();
    const albumId = await createAlbum(author, board);
    const tag = await createTag(board);
    const other = await createTag(board);

    // `PhotoUploader`: an empty date is sent as undefined.
    const response = await api()
      .post('/api/photo')
      .set('Authorization', bearer(author))
      .send({
        board_id: board.board_id,
        album_id: albumId,
        list: [
          uploadedPhoto({ tags: [tag.tag_id, other.tag_id] }),
          uploadedPhoto({
            title: 'second',
            date: undefined,
            location: '',
            img_url: 'https://bucket.example.com/second.jpg',
            thumbnail_url: 'https://bucket.example.com/second_thumb.jpg',
          }),
        ],
      });

    expect(response.status).toBe(200);
    const photos = await photosInAlbum(albumId);
    expect(response.body).toEqual({
      success: true,
      list: photos.map((photo) => photo.content_id),
    });
    expect(photos).toEqual([
      expect.objectContaining({
        author_id: author.user_id,
        board_id: board.board_id,
        category_id: null,
        title: 'Orion',
        text: 'clear sky',
        deleted_at: null,
      }),
      expect.objectContaining({ title: 'second' }),
    ]);
    const [first, second] = photos.map((photo) => photo.content_id);
    expect(await photoRow(first)).toEqual({
      img_url: 'https://bucket.example.com/orion.jpg',
      thumbnail_url: 'https://bucket.example.com/orion_thumb.jpg',
      location: 'Songdo',
      camera: 'EOS 6D',
      lens: '24-70mm',
      focal_length: '50',
      f_stop: '2.8',
      exposure_time: '30',
      iso: '1600',
      date: new Date('2024-01-05T00:00:00Z'),
    });
    expect(await photoRow(second)).toMatchObject({ location: '', date: null });
    expect(await contentTagIds(first)).toEqual(
      [tag.tag_id, other.tag_id].sort(),
    );
    expect(await contentTagIds(second)).toEqual([]);
  });

  it('creates photos outside any album', async () => {
    const { board, author } = await setup();

    const response = await api()
      .post('/api/photo')
      .set('Authorization', bearer(author))
      .send({ board_id: board.board_id, list: [uploadedPhoto()] });

    expect(response.status).toBe(200);
    expect(response.body.list).toHaveLength(1);
    expect(await countContents({ board_id: board.board_id, type: 'PH' })).toBe(
      1,
    );
  });

  it('returns 404 for a deleted album or a content that is not an album', async () => {
    const { board, author } = await setup();
    const deleted = await createAlbum(author, board, {
      deleted_at: new Date(),
    });
    const postId = await createPost(author, board);

    for (const albumId of [deleted, postId]) {
      const response = await api()
        .post('/api/photo')
        .set('Authorization', bearer(author))
        .send({
          board_id: board.board_id,
          album_id: albumId,
          list: [uploadedPhoto()],
        });
      expect(response.status).toBe(404);
    }
    expect(await countContents({ type: 'PH' })).toBe(0);
  });
});

describe('PATCH /api/photo/:photo_id', () => {
  it('changes the title, text, shot info and tags from the body the web sends', async () => {
    const { board, author, categoryId } = await setup();
    const kept = await createTag(board);
    const dropped = await createTag(board);
    const added = await createTag(board);
    const updatedAt = new Date('2020-01-01T00:00:00Z');
    const photoId = await createPhoto(author, board, {
      category_id: categoryId,
      updated_at: updatedAt,
      photo: { camera: 'old', date: new Date('2023-01-01T00:00:00Z') },
    });
    await tagContent(photoId, [kept.tag_id, dropped.tag_id]);

    // `PhotoEditForm.tsx`
    const response = await api()
      .patch(`/api/photo/${photoId}`)
      .set('Authorization', bearer(author))
      .send({
        title: 'renamed',
        text: 'new text',
        tags: [kept.tag_id, added.tag_id],
        photo: {
          date: '2024-02-03',
          location: '',
          camera: 'EOS R',
          lens: '',
          focal_length: '35',
          f_stop: '1.8',
          exposure_time: '10',
          iso: '800',
        },
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    const state = await contentState(photoId);
    expect(state).toMatchObject({
      title: 'renamed',
      text: 'new text',
      category_id: categoryId,
    });
    expect(state.updated_at.getTime()).toBeGreaterThan(updatedAt.getTime());
    expect(await photoRow(photoId)).toMatchObject({
      img_url: expect.any(String),
      location: '',
      camera: 'EOS R',
      lens: '',
      focal_length: '35',
      f_stop: '1.8',
      exposure_time: '10',
      iso: '800',
      date: new Date('2024-02-03T00:00:00Z'),
    });
    expect(await contentTagIds(photoId)).toEqual(
      [kept.tag_id, added.tag_id].sort(),
    );
  });

  it('keeps the date when the web leaves it out (an emptied date field)', async () => {
    const { board, author } = await setup();
    const date = new Date('2023-01-01T00:00:00Z');
    const photoId = await createPhoto(author, board, { photo: { date } });

    const response = await api()
      .patch(`/api/photo/${photoId}`)
      .set('Authorization', bearer(author))
      .send({ title: 't', text: '', tags: [], photo: { camera: 'x' } });

    expect(response.status).toBe(200);
    expect((await photoRow(photoId)).date).toEqual(date);
  });

  it('returns 400 without photo or tags', async () => {
    const { board, author } = await setup();
    const photoId = await createPhoto(author, board, { title: 'kept' });

    for (const body of [
      { title: 'x', text: '', tags: [] },
      { title: 'x', text: '', photo: {} },
    ]) {
      const response = await api()
        .patch(`/api/photo/${photoId}`)
        .set('Authorization', bearer(author))
        .send(body);
      expect(response.status).toBe(400);
    }
    expect((await contentState(photoId)).title).toBe('kept');
  });

  it('rejects another member with 403 and returns 404 for an album id', async () => {
    const { board, author } = await setup();
    const photoId = await createPhoto(author, board);
    const albumId = await createAlbum(author, board);
    const member = await createUser({ grade: 8 });
    const body = { title: 'x', text: '', tags: [], photo: {} };

    const denied = await api()
      .patch(`/api/photo/${photoId}`)
      .set('Authorization', bearer(member))
      .send(body);
    expect(denied.status).toBe(403);
    expect(denied.body).toEqual(FORBIDDEN);

    const notPhoto = await api()
      .patch(`/api/photo/${albumId}`)
      .set('Authorization', bearer(author))
      .send(body);
    expect(notPhoto.status).toBe(404);
    expect(notPhoto.body).toEqual(NOT_FOUND);
  });
});

describe('DELETE /api/photo/:photo_id', () => {
  it('soft-deletes the content and removes the photo row', async () => {
    const { board, author } = await setup();
    const photoId = await createPhoto(author, board);

    const response = await api()
      .delete(`/api/photo/${photoId}`)
      .set('Authorization', bearer(author));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect((await contentState(photoId)).deleted_at).not.toBeNull();
    expect(await photoRow(photoId)).toBeUndefined();

    const again = await api()
      .delete(`/api/photo/${photoId}`)
      .set('Authorization', bearer(author));
    expect(again.status).toBe(404);
    expect(again.body).toEqual(NOT_FOUND);
  });

  it('rejects another member with 403', async () => {
    const { board, author } = await setup();
    const photoId = await createPhoto(author, board);
    const member = await createUser({ grade: 8 });

    const response = await api()
      .delete(`/api/photo/${photoId}`)
      .set('Authorization', bearer(member));

    expect(response.status).toBe(403);
    expect(await photoRow(photoId)).toBeDefined();
  });
});

/*
 * What changes with the move: the writes of one request happen together or
 * not at all, ids that aren't numbers are 404 instead of 500, and bodies
 * missing what the web always sends are 400 instead of 500.
 */
describe('album and photo writes after the move', () => {
  it('keeps no album content when the album row fails', async () => {
    const { board, author } = await setup();

    const response = await withFailingWrites('tb_album', 'INSERT', () =>
      api()
        .post(`/api/photoboard/${board.board_id}/album`)
        .set('Authorization', bearer(author))
        .send({ title: 'album', text: '' }),
    );

    expect(response.status).toBe(500);
    expect(await countContents({ board_id: board.board_id })).toBe(0);
  });

  it('keeps none of the photos when one of them fails', async () => {
    const { board, author } = await setup();
    const albumId = await createAlbum(author, board);

    const response = await api()
      .post('/api/photo')
      .set('Authorization', bearer(author))
      .send({
        board_id: board.board_id,
        album_id: albumId,
        list: [uploadedPhoto(), uploadedPhoto({ tags: ['no_such_tag'] })],
      });

    expect(response.status).toBe(500);
    expect(await photosInAlbum(albumId)).toEqual([]);
  });

  it('keeps the photo when soft-deleting its content fails', async () => {
    const { board, author } = await setup();
    const photoId = await createPhoto(author, board);

    const response = await withFailingWrites('tb_content', 'UPDATE', () =>
      api()
        .delete(`/api/photo/${photoId}`)
        .set('Authorization', bearer(author)),
    );

    expect(response.status).toBe(500);
    expect((await contentState(photoId)).deleted_at).toBeNull();
    expect(await photoRow(photoId)).toBeDefined();
  });

  it('keeps the photo unchanged when its tags fail', async () => {
    const { board, author } = await setup();
    const photoId = await createPhoto(author, board, {
      title: 'kept',
      photo: { camera: 'kept' },
    });

    const response = await api()
      .patch(`/api/photo/${photoId}`)
      .set('Authorization', bearer(author))
      .send({
        title: 'renamed',
        text: '',
        tags: ['no_such_tag'],
        photo: { camera: 'new' },
      });

    expect(response.status).toBe(500);
    expect((await contentState(photoId)).title).toBe('kept');
    expect((await photoRow(photoId)).camera).toBe('kept');
  });

  it('gives new photos a content_uuid', async () => {
    const { board, author } = await setup();
    const albumId = await createAlbum(author, board);

    await api()
      .post('/api/photo')
      .set('Authorization', bearer(author))
      .send({
        board_id: board.board_id,
        album_id: albumId,
        list: [uploadedPhoto()],
      });

    const [photo] = await photosInAlbum(albumId);
    expect(photo.content_uuid).toEqual(expect.any(String));
  });

  it('returns 404 for a non-numeric id', async () => {
    const { author } = await setup();

    for (const [method, path, body] of [
      ['patch', '/api/album/abc', { album: {} }],
      ['delete', '/api/album/abc', {}],
      ['patch', '/api/album/abc/thumbnail', { tn_photo_id: 1 }],
      ['patch', '/api/photo/abc', { tags: [], photo: {} }],
      ['delete', '/api/photo/abc', {}],
    ] as const) {
      const request = api()[method](path);
      const response = await request
        .set('Authorization', bearer(author))
        .send(body);
      expect(response.status).toBe(404);
    }
  });

  it('returns 400 for a photo list the web never sends', async () => {
    const { board, author } = await setup();

    for (const body of [
      { board_id: board.board_id },
      { board_id: board.board_id, list: [{ title: 'no image' }] },
      {
        board_id: board.board_id,
        list: [uploadedPhoto({ date: 'not a date' })],
      },
      { board_id: board.board_id, list: [uploadedPhoto({ tags: undefined })] },
    ]) {
      const response = await api()
        .post('/api/photo')
        .set('Authorization', bearer(author))
        .send(body);
      expect(response.status).toBe(400);
    }
    expect(await countContents({ board_id: board.board_id })).toBe(0);
  });

  it('returns 400 for an album edit without its album fields', async () => {
    const { board, author } = await setup();
    const albumId = await createAlbum(author, board, { title: 'kept' });

    const response = await api()
      .patch(`/api/album/${albumId}`)
      .set('Authorization', bearer(author))
      .send({ title: 'renamed' });

    expect(response.status).toBe(400);
    expect((await contentState(albumId)).title).toBe('kept');
  });
});
