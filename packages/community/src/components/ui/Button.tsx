import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderCircle } from 'lucide-react';
import { cn } from '~/lib/utils';

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700 disabled:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-white hover:bg-primary-hover disabled:bg-surface-sunken disabled:text-gray-400',
        secondary:
          'border border-gray-300 bg-surface text-fg hover:bg-gray-50 disabled:text-gray-400',
        ghost: 'text-navy-700 hover:bg-primary-soft disabled:text-gray-400',
        // Accent is for the single most important action on a screen.
        accent:
          'bg-accent font-bold text-navy-900 hover:bg-star-400 disabled:bg-surface-sunken disabled:text-gray-400',
        danger:
          'bg-danger text-white hover:brightness-95 disabled:bg-surface-sunken disabled:text-gray-400',
      },
      size: {
        md: 'h-11 px-[18px] text-sm',
        sm: 'h-9 px-3.5 text-label',
        icon: 'size-11 [&_svg]:size-5',
        'icon-sm': 'size-9',
      },
      block: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    /** Renders the child element (e.g. a router `Link`) with button styles. */
    asChild?: boolean;
    loading?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      block,
      asChild = false,
      loading = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const classes = cn(buttonVariants({ variant, size, block }), className);

    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <LoaderCircle className="animate-spin" aria-hidden />}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
