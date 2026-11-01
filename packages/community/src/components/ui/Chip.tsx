import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '~/lib/utils';

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  /** `success` is for an on/off filter such as 대여 가능만. */
  tone?: 'primary' | 'success';
};

/**
 * A rounded filter or choice chip (분류, 회기, 상태 …). The caller sets the
 * ARIA state that fits: `role="radio"` + `aria-checked` in a choice group,
 * `aria-pressed` for a filter toggle.
 */
export const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      selected = false,
      tone = 'primary',
      className,
      type = 'button',
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'flex h-8.5 shrink-0 items-center rounded-full border px-3.5 text-label transition-colors',
        selected
          ? tone === 'success'
            ? 'border-success bg-success-soft text-success'
            : 'border-primary bg-primary text-white'
          : 'border-border bg-surface font-medium text-gray-700 hover:border-gray-300',
        className,
      )}
      {...props}
    />
  ),
);
Chip.displayName = 'Chip';
