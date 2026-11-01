import { useRef, type ReactNode, type TouchEvent } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { cn, resolveImageUrl } from '~/lib/utils';

/** Horizontal travel, in px, that counts as a swipe. */
const SWIPE_DISTANCE = 50;

type PhotoStageProps = {
  src?: string;
  alt: string;
  /** Shows the 이전 사진 button, and swiping right goes there. */
  onPrev?: () => void;
  /** Shows the 다음 사진 button, and swiping left goes there. */
  onNext?: () => void;
  /** Pill at the bottom on desktop, e.g. the album title. */
  label?: ReactNode;
  className?: string;
};

const arrowClassName =
  'absolute top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:flex';

/**
 * The photo on a dark stage. Mobile swipes between photos; desktop has
 * arrow buttons and opens the photo full screen on click.
 */
export default function PhotoStage({
  src,
  alt,
  onPrev,
  onNext,
  label,
  className,
}: PhotoStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    // Two fingers are a pinch zoom, not a swipe.
    if (e.touches.length !== 1) {
      touchStart.current = null;
      return;
    }
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) onNext?.();
    else onPrev?.();
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      stageRef.current?.requestFullscreen?.();
    }
  };

  return (
    <div
      ref={stageRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={cn(
        'group relative flex items-center justify-center overflow-hidden bg-navy-950',
        className,
      )}
    >
      {src && (
        <img
          src={resolveImageUrl(src)}
          alt={alt}
          onClick={toggleFullscreen}
          className="max-h-full max-w-full object-contain md:cursor-zoom-in"
        />
      )}
      {onPrev && (
        <button
          type="button"
          aria-label="이전 사진"
          onClick={onPrev}
          className={cn(arrowClassName, 'left-4')}
        >
          <ChevronLeft className="size-[22px]" />
        </button>
      )}
      {onNext && (
        <button
          type="button"
          aria-label="다음 사진"
          onClick={onNext}
          className={cn(arrowClassName, 'right-4')}
        >
          <ChevronRight className="size-[22px]" />
        </button>
      )}
      {label && (
        <span className="absolute bottom-4 left-1/2 hidden max-w-[70%] -translate-x-1/2 truncate rounded-full bg-navy-950/70 px-3 py-1.5 text-caption text-fg-on-brand-muted md:block">
          {label}
        </span>
      )}
      <button
        type="button"
        aria-label="전체 화면"
        onClick={toggleFullscreen}
        className="absolute right-4 bottom-4 hidden size-9 items-center justify-center rounded-full bg-white/10 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 md:flex"
      >
        <Maximize2 className="size-4" />
      </button>
    </div>
  );
}
