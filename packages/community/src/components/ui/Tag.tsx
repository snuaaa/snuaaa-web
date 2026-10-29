import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/lib/utils';

const tagVariants = cva(
  'inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-micro',
  {
    variants: {
      variant: {
        // Board category chips
        neutral: 'rounded-sm bg-gray-100 px-2 py-1 text-gray-700',
        brand: 'rounded-sm bg-primary-soft px-2 py-1 text-navy-700',
        accent: 'rounded-sm bg-accent-soft px-2 py-1 text-star-800',
        // Hashtags
        outline:
          'rounded-full border border-gray-300 px-2 py-[3px] text-gray-700',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

type TagProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof tagVariants>;

export function Tag({ className, variant, ...props }: TagProps) {
  return (
    <span className={cn(tagVariants({ variant }), className)} {...props} />
  );
}

const badgeVariants = cva(
  'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-caption font-semibold whitespace-nowrap',
  {
    variants: {
      tone: {
        success: 'bg-success-soft text-success',
        // warning (#B7791F) fails contrast on its soft background
        warning: 'bg-warning-soft text-star-800',
        danger: 'bg-danger-soft text-danger',
        info: 'bg-info-soft text-info',
        neutral: 'bg-gray-100 text-gray-700',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

/** A status chip, e.g. 대여 가능 / 대여 중 / 연체. */
export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

type CountBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  count: number;
  max?: number;
};

/** A red number dot for unread or pending counts. Renders nothing at 0. */
export function CountBadge({
  count,
  max = 99,
  className,
  ...props
}: CountBadgeProps) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-micro font-bold text-white tabular-nums',
        className,
      )}
      {...props}
    >
      {count > max ? `${max}+` : count}
    </span>
  );
}
