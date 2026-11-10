import type { CSSProperties } from 'react';

// Stand-in for the `next/image` props this site used (with `unoptimized: true`,
// so Next never resized anything). `layout="fill"` covers the positioned parent.
type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  layout?: 'fill';
  objectFit?: CSSProperties['objectFit'];
  priority?: boolean;
};

const Image: React.FC<Props> = ({
  src,
  alt,
  width,
  height,
  layout,
  objectFit,
  priority,
}) => {
  const style: CSSProperties =
    layout === 'fill'
      ? {
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit,
        }
      : { maxWidth: '100%', height: 'auto', objectFit };

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={style}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
};

export default Image;
