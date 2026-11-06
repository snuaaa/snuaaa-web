import type { CSSProperties } from 'react';
import { cn } from '~/lib/utils';

type Props = {
  className?: string;
  style?: CSSProperties;
};

/** A pulsing placeholder block; size and shape come from `className`. */
export function Skeleton({ className, style }: Props) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      style={style}
    />
  );
}
