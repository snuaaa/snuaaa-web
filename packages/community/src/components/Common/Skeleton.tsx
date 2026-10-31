import type { CSSProperties } from 'react';
import { cn } from '~/lib/utils';

type Props = {
  className?: string;
  style?: CSSProperties;
};

const Skeleton = ({ className, style }: Props) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      style={style}
    />
  );
};

export default Skeleton;
