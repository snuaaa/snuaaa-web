import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { useRouter } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { cn } from '~/lib/utils';

type BackButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Renders the child (e.g. a router `Link` to the parent page) instead. */
  asChild?: boolean;
};

/**
 * The 44px chevron at the left of a mobile top bar. Without `onClick` or
 * `asChild` it goes back in history, or home when there is no history.
 */
export const BackButton = forwardRef<HTMLButtonElement, BackButtonProps>(
  ({ asChild = false, onClick, className, children, ...props }, ref) => {
    const router = useRouter();
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        aria-label="뒤로"
        {...(asChild
          ? {}
          : {
              type: 'button' as const,
              onClick:
                onClick ??
                (() =>
                  router.history.canGoBack()
                    ? router.history.back()
                    : router.navigate({ to: '/' })),
            })}
        className={cn(
          'flex size-11 shrink-0 items-center justify-center',
          className,
        )}
        {...props}
      >
        <Slottable>{children}</Slottable>
        <ChevronLeft className="size-[22px]" />
      </Comp>
    );
  },
);
BackButton.displayName = 'BackButton';
