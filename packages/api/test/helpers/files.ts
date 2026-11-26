import sharp from 'sharp';

/** A small JPEG the upload endpoints can resize, as the web would attach. */
export async function jpegImage(width = 40, height = 30) {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 20, g: 30, b: 60 },
    },
  })
    .jpeg()
    .toBuffer();
}

/** A JPEG of random noise, which compresses badly, so it is large. */
export async function largeJpegImage() {
  return sharp({
    create: {
      width: 800,
      height: 800,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
      noise: { type: 'gaussian', mean: 128, sigma: 60 },
    },
  })
    .jpeg({ quality: 95 })
    .toBuffer();
}

/**
 * Runs `run` with a file in `upload/`, the legacy local-disk folder served
 * under `/static`, and removes it afterwards.
 */
export async function withStaticFile<T>(
  name: string,
  content: Buffer,
  run: () => Promise<T>,
) {
  const { mkdir, rm, writeFile } = await import('fs/promises');
  const path = await import('path');
  const folder = path.join(__dirname, '..', '..', 'upload', 'test');
  await mkdir(folder, { recursive: true });
  try {
    await writeFile(path.join(folder, name), content);
    return await run();
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
}
