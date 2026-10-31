import type { ReactNode } from 'react';

/** Empty and error states inside a post list. */
export function ListMessage({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-4 py-16 text-center">
      <p className="text-heading">{title}</p>
      {description && (
        <p className="text-label font-normal text-fg-muted">{description}</p>
      )}
      {action && <div className="pt-3">{action}</div>}
    </div>
  );
}

/** Yellow dot on posts (or comments) from the last 24 hours. */
export function NewDot({ label = '새 글' }: { label?: string }) {
  return (
    <span
      className="block size-1.5 shrink-0 rounded-full bg-accent"
      aria-label={label}
      role="img"
    />
  );
}
