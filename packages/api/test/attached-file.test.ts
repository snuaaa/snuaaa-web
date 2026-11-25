import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import {
  bearer,
  createAttachedFile,
  createBoard,
  createDocument,
  createPost,
  createUser,
  type User,
} from './helpers/factories';
import { attachedFileRows } from './helpers/db';
import { s3UploadKeys } from './helpers/aws';

/*
 * Attached files: the web uploads them one by one after saving a post or a
 * document (`ContentService.createFile`, a multipart `attachedFile`), deletes
 * them while editing (`FileService.deleteFile`), and links to the download
 * without a token (`DownloadFile`).
 */

const FORBIDDEN = {
  success: false,
  error: 'FORBIDDEN',
  message: 'Permission denied',
  code: 4001,
};

async function setup() {
  const board = await createBoard({ lv_read: 10, lv_write: 9, lv_edit: 1 });
  const author = await createUser({ grade: 8 });
  const postId = await createPost(author, board);
  return { board, author, postId };
}

function upload(
  user: User,
  contentId: number | string,
  name = 'minutes.pdf',
  type = 'application/pdf',
) {
  return api()
    .post(`/api/content/${contentId}/file`)
    .set('Authorization', bearer(user))
    .attach('attachedFile', Buffer.from('%PDF-1.4'), {
      filename: name,
      contentType: type,
    });
}

function remove(user: User, fileId: number | string) {
  return api().delete(`/api/file/${fileId}`).set('Authorization', bearer(user));
}

describe('POST /api/content/:content_id/file', () => {
  it('uploads the file to S3 and attaches it with its type', async () => {
    const { author, postId } = await setup();

    const response = await upload(author, postId, 'minutes.pdf');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    const [key] = s3UploadKeys();
    expect(key).toMatch(/^file\/attached-file\/\d{8}\/[0-9a-f-]{36}\.pdf$/);
    expect(await attachedFileRows(postId)).toEqual([
      {
        file_id: expect.any(Number),
        original_name: 'minutes.pdf',
        file_path: expect.stringContaining(key!),
        file_url: expect.stringContaining(key!),
        file_type: 'PDF',
        download_count: 0,
        deleted_at: null,
      },
    ]);
  });

  it('sorts files by their extension, whatever its case', async () => {
    const { author, postId } = await setup();

    for (const name of [
      'a.JPG',
      'b.png',
      'c.docx',
      'd.XLS',
      'e.pptx',
      'f.hwp',
      'g.ZIP',
      'h.txt',
    ]) {
      await upload(author, postId, name, 'application/octet-stream');
    }

    expect(
      (await attachedFileRows(postId)).map((file) => file.file_type),
    ).toEqual(['IMG', 'IMG', 'DOC', 'XLS', 'PPT', 'HWP', 'ZIP', 'N']);
  });

  it('answers 400 when no file is attached', async () => {
    const { author, postId } = await setup();

    const response = await api()
      .post(`/api/content/${postId}/file`)
      .set('Authorization', bearer(author))
      .field('other', 'x');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('BAD_REQUEST');
    expect(await attachedFileRows(postId)).toEqual([]);
  });
});

describe('DELETE /api/file/:file_id', () => {
  it('soft-deletes the file', async () => {
    const { author, postId } = await setup();
    const fileId = await createAttachedFile(postId);

    const response = await remove(author, fileId);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect((await attachedFileRows(postId))[0].deleted_at).not.toBeNull();
  });

  it('lets a board editor delete the file of a document', async () => {
    const { board, author } = await setup();
    const documentId = await createDocument(author, board);
    const fileId = await createAttachedFile(documentId);

    const response = await remove(await createUser({ grade: 1 }), fileId);

    expect(response.status).toBe(200);
    expect((await attachedFileRows(documentId))[0].deleted_at).not.toBeNull();
  });
});

describe('GET /api/content/:content_id/file/:file_id', () => {
  it('redirects to the S3 file without a token and counts the download', async () => {
    const { postId } = await setup();
    const fileId = await createAttachedFile(postId, {
      file_url: 'https://bucket.example.com/minutes.pdf',
    });

    const response = await api().get(`/api/content/${postId}/file/${fileId}`);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(
      'https://bucket.example.com/minutes.pdf',
    );
    await expect
      .poll(async () => (await attachedFileRows(postId))[0].download_count)
      .toBe(1);
  });

  it('answers 404 for an unknown or deleted file', async () => {
    const { postId } = await setup();
    const deleted = await createAttachedFile(postId, {
      deleted_at: new Date(),
    });

    for (const fileId of [999999, deleted]) {
      const response = await api().get(`/api/content/${postId}/file/${fileId}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('FILE NOT FOUND');
    }
  });
});

describe('attached files after the move', () => {
  it("refuses to attach a file to someone else's content", async () => {
    const { postId } = await setup();

    const response = await upload(await createUser({ grade: 8 }), postId);

    expect(response.status).toBe(403);
    expect(response.body).toEqual(FORBIDDEN);
    expect(s3UploadKeys()).toEqual([]);
    expect(await attachedFileRows(postId)).toEqual([]);
  });

  it("refuses to delete someone else's file", async () => {
    const { postId } = await setup();
    const fileId = await createAttachedFile(postId);

    const response = await remove(await createUser({ grade: 8 }), fileId);

    expect(response.status).toBe(403);
    expect(response.body).toEqual(FORBIDDEN);
    expect((await attachedFileRows(postId))[0].deleted_at).toBeNull();
  });

  it('answers 404 for an unknown, deleted or non-numeric content or file', async () => {
    const { board, author, postId } = await setup();
    const deletedPost = await createPost(author, board, {
      deleted_at: new Date(),
    });
    const deletedFile = await createAttachedFile(postId, {
      deleted_at: new Date(),
    });

    const responses = [
      await upload(author, 999999),
      await upload(author, deletedPost),
      await upload(author, 'abc'),
      await remove(author, 999999),
      await remove(author, deletedFile),
      await remove(author, 'abc'),
      await api().get(`/api/content/${postId}/file/abc`),
    ];

    expect(responses.map((response) => response.status)).toEqual([
      404, 404, 404, 404, 404, 404, 404,
    ]);
    expect(s3UploadKeys()).toEqual([]);
  });

  it('answers 404 for a file of another content', async () => {
    const { board, author, postId } = await setup();
    const otherId = await createPost(author, board);
    const fileId = await createAttachedFile(otherId);

    const response = await api().get(`/api/content/${postId}/file/${fileId}`);

    expect(response.status).toBe(404);
  });

  it('keeps a Korean file name as the browser sends it, in UTF-8', async () => {
    const { author, postId } = await setup();

    await upload(author, postId, '회의록 2024.pdf');

    expect((await attachedFileRows(postId))[0].original_name).toBe(
      '회의록 2024.pdf',
    );
  });

  it('no longer serves the S3 migration', async () => {
    const response = await api()
      .post('/api/file/migrate')
      .set('Authorization', bearer(await createUser({ grade: 1 })));

    expect(response.status).toBe(404);
  });
});
