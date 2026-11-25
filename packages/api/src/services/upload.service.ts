import { BadRequestError } from '../errors';
import { resizeImageBuffer } from '../utils/resize';
import { uploadImageToS3, type S3ResourceType } from '../utils/upload';

/** The thumbnail's short side, in pixels. */
const THUMBNAIL_SHORT_SIDE = 360;

/**
 * Resizes the image (and, when asked, a thumbnail of it) and uploads it to
 * S3 under the resource type. Throws 400 when the file is not an image the
 * resizer can read, before anything is uploaded.
 */
export async function uploadImage(
  image: Buffer,
  resourceType: S3ResourceType,
  withThumbnail: boolean,
) {
  let resized: Buffer[];
  try {
    resized = await Promise.all([
      resizeImageBuffer(image),
      ...(withThumbnail
        ? [
            resizeImageBuffer(image, {
              shortSideSize: THUMBNAIL_SHORT_SIDE,
            }),
          ]
        : []),
    ]);
  } catch {
    throw new BadRequestError('Image is not valid');
  }
  const [imgUrl, thumbnailUrl] = await Promise.all(
    resized.map((buffer) => uploadImageToS3(buffer, resourceType)),
  );
  return { imgUrl, thumbnailUrl };
}
