import type { CSSProperties } from 'react';
import { cn } from '~/lib/utils';

type Props = {
  className?: string;
  style?: CSSProperties;
};

/** A slowly breathing placeholder block; size and shape come from `className`. */
export function Skeleton({ className, style }: Props) {
  return (
    <div
      className={cn(
        'animate-breathe rounded-md bg-gray-200 motion-reduce:animate-none',
        className,
      )}
      style={style}
    />
  );
}
