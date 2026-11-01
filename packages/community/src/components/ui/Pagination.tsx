import { ChevronLeft, ChevronRight, Ellipsis } from 'lucide-react';
import { ViewportSize, useViewportSize } from '~/contexts/viewportSize';
import { cn } from '~/lib/utils';
import { Button } from './Button';

type LoadMoreProps = {
  onClick: () => void;
  loading?: boolean;
  /** Renders nothing when there is nothing left to load. */
  hasMore: boolean;
  className?: string;
};

/** Mobile lists load the next page with this button (or infinite scroll). */
export function LoadMore({
  onClick,
  loading,
  hasMore,
  className,
}: LoadMoreProps) {
  if (!hasMore) return null;
  return (
    <Button
      variant="secondary"
      block
      loading={loading}
      onClick={onClick}
      className={cn('border-border text-navy-700', className)}
    >
      더 보기
    </Button>
  );
}

type PaginationProps = {
  /** 1-based */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /**
   * Most page slots to show, counting 1, the last page and the "…" gaps.
   * Odd numbers keep the current page centered. Defaults to 9 on desktop
   * and 7 below it so the row fits a phone.
   */
  maxButtons?: number;
  className?: string;
};

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

/**
 * The first and last pages stay visible and the gaps fold into "…":
 * 1 2 3 4 5 6 7 … 100 / 1 … 48 49 50 51 52 … 100 / 1 … 94 95 96 97 98 99 100
 */
function getPageSlots(page: number, totalPages: number, maxButtons: number) {
  const max = Math.max(maxButtons, 5);
  if (totalPages <= max) return range(1, totalPages);

  const half = Math.floor(max / 2);
  if (page <= half + 1) {
    return [...range(1, max - 2), 'end-gap' as const, totalPages];
  }
  if (page >= totalPages - half) {
    return [
      1,
      'start-gap' as const,
      ...range(totalPages - max + 3, totalPages),
    ];
  }
  const siblings = Math.floor((max - 5) / 2);
  return [
    1,
    'start-gap' as const,
    ...range(page - siblings, page + siblings),
    'end-gap' as const,
    totalPages,
  ];
}

/** Numbered pages, for lists that keep the page in the URL. */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  maxButtons,
  className,
}: PaginationProps) {
  const viewport = useViewportSize();
  if (totalPages <= 1) return null;

  const slots = getPageSlots(
    page,
    totalPages,
    maxButtons ?? (viewport === ViewportSize.Desktop ? 9 : 7),
  );

  return (
    <nav
      aria-label="페이지"
      className={cn(
        'flex items-center justify-center gap-0.5 md:gap-1',
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        className="size-8 md:size-9"
        aria-label="이전 페이지"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft />
      </Button>
      {slots.map((slot) =>
        typeof slot === 'string' ? (
          <span
            key={slot}
            className="flex size-8 shrink-0 items-center justify-center text-gray-400 md:size-9"
            aria-hidden
          >
            <Ellipsis className="size-4" />
          </span>
        ) : (
          <button
            key={slot}
            type="button"
            aria-label={`${slot}페이지`}
            aria-current={slot === page ? 'page' : undefined}
            onClick={() => onPageChange(slot)}
            className={cn(
              'size-8 shrink-0 rounded-full md:size-9 text-sm tabular-nums transition-colors',
              slot === page
                ? 'bg-primary font-bold text-white'
                : 'font-medium text-fg-muted hover:bg-gray-100 hover:text-fg',
            )}
          >
            {slot}
          </button>
        ),
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        className="size-8 md:size-9"
        aria-label="다음 페이지"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}
