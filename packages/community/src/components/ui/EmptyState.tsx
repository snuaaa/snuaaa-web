import type { ReactNode } from 'react';
import { cn } from '~/lib/utils';

type EmptyStateProps = {
  title: string;
  description?: string;
  /** A button under the message, e.g. 다시 시도 or 필터 초기화. */
  action?: ReactNode;
  className?: string;
};

/** The empty or load-error message in place of a list. */
export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1.5 px-4 py-16 text-center',
        className,
      )}
    >
      <p className="text-heading">{title}</p>
      {description && (
        <p className="text-label font-normal text-fg-muted">{description}</p>
      )}
      {action && <div className="pt-3">{action}</div>}
    </div>
  );
}
