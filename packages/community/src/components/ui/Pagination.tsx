import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  /** How many page numbers to show at once. */
  window?: number;
  className?: string;
};

/** Numbered pages, for desktop lists. */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  window = 10,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = Math.floor((page - 1) / window) * window + 1;
  const end = Math.min(start + window - 1, totalPages);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav
      aria-label="페이지"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="이전 페이지"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft />
      </Button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onPageChange(p)}
          className={cn(
            'size-9 rounded-md text-sm tabular-nums transition-colors',
            p === page
              ? 'bg-primary font-semibold text-white'
              : 'text-fg-muted hover:bg-gray-100 hover:text-fg',
          )}
        >
          {p}
        </button>
      ))}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="다음 페이지"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}
