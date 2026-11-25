import sharp from 'sharp';

type Metadata = { orientation?: number; height: number; width: number };
type SizeOption = { longSideSize: number } | { shortSideSize: number };
const DEFAULT_SIZE_OPTION: SizeOption = { longSideSize: 1920 };

const getResizeOption = (metadata: Metadata, options: SizeOption) => {
  const orientation = metadata.orientation ?? 1;
  const isRotated = orientation >= 5 && orientation <= 8;
  const isHeightGreater = isRotated
    ? metadata.width > metadata.height
    : metadata.height > metadata.width;

  if (isHeightGreater) {
    return 'longSideSize' in options
      ? { height: options.longSideSize }
      : { width: options.shortSideSize };
  } else {
    return 'longSideSize' in options
      ? { width: options.longSideSize }
      : { height: options.shortSideSize };
  }
};

export async function resizeImageBuffer(
  fileBuffer: Buffer,
  sizeOption: SizeOption = DEFAULT_SIZE_OPTION,
): Promise<Buffer> {
  const image = sharp(fileBuffer);
  const metadata = await image.rotate().metadata();
  const resizeOption = getResizeOption(metadata, sizeOption);

  return image.resize(resizeOption).toFormat('jpeg').toBuffer();
}
