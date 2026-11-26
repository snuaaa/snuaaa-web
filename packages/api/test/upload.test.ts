import { PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import { bearer, createUser, type User } from './helpers/factories';
import { s3Mock, s3UploadKeys } from './helpers/aws';
import { jpegImage } from './helpers/files';

/*
 * The image upload the web makes for profiles, photos, equipment and the
 * editor (`UploadService.uploadImage`): a multipart `image`, with the
 * resource type and whether to make a thumbnail in the query.
 */

const S3_URL =
  '^https://snuaaa-test\\.s3\\.ap-northeast-2\\.amazonaws\\.com/image/photo/\\d{8}/[0-9a-f-]{36}$';

function upload(
  user: User,
  query: Record<string, string>,
  image?: Buffer,
  name = 'photo.jpg',
) {
  const request = api()
    .post('/api/upload/image')
    .query(query)
    .set('Authorization', bearer(user));
  return image
    ? request.attach('image', image, {
        filename: name,
        contentType: 'image/jpeg',
      })
    : request.field('other', 'x');
}

function uploadedImages() {
  return Promise.all(
    s3Mock
      .commandCalls(PutObjectCommand)
      .map((call) => sharp(call.args[0].input.Body as Buffer).metadata()),
  );
}

describe('POST /api/upload/image', () => {
  it('resizes the image to 1920px on its long side and uploads it to S3', async () => {
    const response = await upload(
      await createUser(),
      { type: 'photo' },
      await jpegImage(400, 300),
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      imgUrl: expect.stringMatching(new RegExp(S3_URL)),
      result: 'success',
    });
    expect(s3UploadKeys()).toHaveLength(1);
    expect(await uploadedImages()).toEqual([
      expect.objectContaining({ format: 'jpeg', width: 1920, height: 1440 }),
    ]);
  });

  it('also uploads a thumbnail, 360px on its short side, when asked', async () => {
    const response = await upload(
      await createUser(),
      { type: 'photo', thumbnail: 'true' },
      await jpegImage(400, 300),
    );

    expect(response.body).toEqual({
      imgUrl: expect.stringMatching(new RegExp(S3_URL)),
      thumbnailUrl: expect.stringMatching(new RegExp(S3_URL)),
      result: 'success',
    });
    expect(response.body.thumbnailUrl).not.toBe(response.body.imgUrl);
    const sizes = (await uploadedImages()).map(({ width, height }) => [
      width,
      height,
    ]);
    expect(sizes).toEqual(
      expect.arrayContaining([
        [1920, 1440],
        [480, 360],
      ]),
    );
  });

  it('makes no thumbnail for thumbnail=false', async () => {
    const response = await upload(
      await createUser(),
      { type: 'photo', thumbnail: 'false' },
      await jpegImage(),
    );

    expect(response.body).not.toHaveProperty('thumbnailUrl');
    expect(s3UploadKeys()).toHaveLength(1);
  });

  it('answers 400 without an image or a known resource type', async () => {
    const user = await createUser();
    const image = await jpegImage();

    const responses = [
      await upload(user, { type: 'photo' }),
      await upload(user, {}, image),
      await upload(user, { type: 'poster' }, image),
    ];

    expect(responses.map((response) => response.status)).toEqual([
      400, 400, 400,
    ]);
    expect(responses.map((response) => response.body)).toEqual([
      expect.objectContaining({
        error: 'BAD_REQUEST',
        message: 'Image is not attached',
      }),
      expect.objectContaining({
        error: 'BAD_REQUEST',
        message: 'Invalid or missing resource type',
      }),
      expect.objectContaining({
        error: 'BAD_REQUEST',
        message: 'Invalid or missing resource type',
      }),
    ]);
    expect(s3UploadKeys()).toEqual([]);
  });
});

describe('image upload after the move', () => {
  it('answers 400 for a file that is not an image, and uploads nothing', async () => {
    const response = await upload(
      await createUser(),
      { type: 'photo', thumbnail: 'true' },
      Buffer.from('not an image'),
      'notes.txt',
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: 'BAD_REQUEST',
      message: 'Image is not valid',
    });
    expect(s3UploadKeys()).toEqual([]);
  });

  it('no longer serves the local-disk image upload the web stopped calling', async () => {
    const response = await api()
      .post('/api/image')
      .set('Authorization', bearer(await createUser()))
      .attach('attachedImage', await jpegImage(), 'photo.jpg');

    expect(response.status).toBe(404);
  });
});
