import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { cn } from '~/lib/utils';

type FabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  /** Renders the child element (e.g. a router `Link`) as the button. */
  asChild?: boolean;
};

/**
 * The floating 글쓰기 / 사진 올리기 / 문서 등록 button. It sits above the
 * mobile tab bar via `--fab-bottom`, which the layout can set.
 */
export const Fab = forwardRef<HTMLButtonElement, FabProps>(
  ({ icon, asChild, className, children, type, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? 'button')}
        className={cn(
          'fixed right-4 bottom-[var(--fab-bottom,1.5rem)] z-30 inline-flex h-13 items-center gap-2 rounded-full bg-primary pr-5 pl-4 text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(11,26,58,0.24)] transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700 [&_svg]:size-5 [&_svg]:text-accent',
          className,
        )}
        {...props}
      >
        {icon}
        <Slottable>{children}</Slottable>
      </Comp>
    );
  },
);
Fab.displayName = 'Fab';
