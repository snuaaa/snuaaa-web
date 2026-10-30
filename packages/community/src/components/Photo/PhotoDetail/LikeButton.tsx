import { Heart } from 'lucide-react';
import { cn } from '~/lib/utils';

/** 추천 toggle with its count. Hearts use the danger token. */
export default function LikeButton({
  liked,
  count,
  onClick,
  disabled,
  size,
}: {
  liked: boolean;
  count: number;
  onClick: () => void;
  disabled: boolean;
  size: 'md' | 'sm';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={liked}
      aria-label={`추천 ${count}`}
      className={cn(
        'flex shrink-0 items-center gap-1.5 rounded-full border font-semibold transition-colors',
        size === 'md' ? 'h-10 px-3.5 text-sm' : 'h-9 px-3 text-label',
        liked
          ? 'border-danger bg-danger-soft'
          : 'border-gray-300 bg-surface hover:bg-gray-50',
      )}
    >
      <Heart
        className={cn(
          size === 'md' ? 'size-[18px]' : 'size-4',
          liked ? 'fill-danger text-danger' : 'text-gray-700',
        )}
        strokeWidth={1.8}
        aria-hidden
      />
      {count}
    </button>
  );
}
