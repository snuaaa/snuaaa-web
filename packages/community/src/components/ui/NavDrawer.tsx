import {
  createContext,
  forwardRef,
  useContext,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Slot } from '@radix-ui/react-slot';
import { ChevronDown, ExternalLink, X } from 'lucide-react';
import { cn } from '~/lib/utils';

const CloseContext = createContext<() => void>(() => undefined);

type NavDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  /** Groups opened when the drawer first renders, e.g. the current page's. */
  defaultOpenGroups?: string[];
  /** Pinned under the menu, e.g. the profile or 로그아웃. */
  footer?: ReactNode;
  children: ReactNode;
};

/**
 * The full site menu, sliding in from the left on mobile. Groups fold open
 * independently, like the old `MenuDrawer`.
 */
export function NavDrawer({
  open,
  onOpenChange,
  title = '메뉴',
  defaultOpenGroups,
  footer,
  children,
}: NavDrawerProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-navy-950/48 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in motion-reduce:animate-none" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col bg-surface-brand pt-[env(safe-area-inset-top)] text-fg-on-brand shadow-lg outline-none data-[state=closed]:animate-slide-out-left data-[state=open]:animate-slide-in-left motion-reduce:animate-none"
        >
          <div className="flex h-14 shrink-0 items-center justify-between pr-2 pl-5">
            <DialogPrimitive.Title className="text-label text-fg-on-brand-muted">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="flex size-10 items-center justify-center rounded-md text-fg-on-brand-muted hover:bg-surface-brand-raised hover:text-fg-on-brand"
              aria-label="메뉴 닫기"
            >
              <X className="size-5" />
            </DialogPrimitive.Close>
          </div>
          <nav className="min-h-0 flex-1 overflow-y-auto pb-4 select-none">
            <CloseContext.Provider value={() => onOpenChange(false)}>
              <AccordionPrimitive.Root
                type="multiple"
                defaultValue={defaultOpenGroups}
              >
                {children}
              </AccordionPrimitive.Root>
            </CloseContext.Provider>
          </nav>
          {footer && (
            <div className="shrink-0 border-t border-navy-800 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

type NavGroupProps = {
  /** Unique within the drawer; used by `defaultOpenGroups`. */
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
};

/** A titled group (A.A.A., Notice, Daily …) that folds its items. */
export function NavGroup({ value, label, icon, children }: NavGroupProps) {
  return (
    <AccordionPrimitive.Item value={value}>
      <AccordionPrimitive.Header asChild>
        <div>
          <AccordionPrimitive.Trigger className="group flex h-12 w-full items-center gap-3 px-5 text-left font-bold transition-colors hover:bg-surface-brand-raised [&>svg]:size-5 [&>svg]:shrink-0">
            {icon}
            <span className="flex-1">{label}</span>
            <ChevronDown className="text-fg-on-brand-muted transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none" />
          </AccordionPrimitive.Trigger>
        </div>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none">
        <ul className="mb-2 ml-[2.875rem] border-l border-navy-700">
          {children}
        </ul>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}

type NavItemProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Renders the child (e.g. a router `Link`) with item styles. */
  asChild?: boolean;
  /** Opens in a new tab with an external-link icon, and keeps the drawer open. */
  external?: boolean;
};

/**
 * One link in a `NavGroup`. Router links that match the current page get
 * `aria-current="page"` and show as active.
 */
export const NavItem = forwardRef<HTMLAnchorElement, NavItemProps>(
  (
    {
      asChild = false,
      external = false,
      className,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const close = useContext(CloseContext);
    const Comp = asChild ? Slot : 'a';
    return (
      <li>
        <Comp
          ref={ref}
          className={cn(
            '-ml-px flex min-h-11 items-center justify-between gap-2 border-l-2 border-transparent py-2 pr-5 pl-4 text-sm text-fg-on-brand-muted transition-colors hover:bg-surface-brand-raised hover:text-fg-on-brand aria-[current=page]:border-accent aria-[current=page]:font-semibold aria-[current=page]:text-fg-on-brand [&_svg]:size-4 [&_svg]:shrink-0',
            className,
          )}
          {...(external && { target: '_blank', rel: 'noreferrer' })}
          onClick={(e) => {
            onClick?.(e);
            if (!external && !e.defaultPrevented) close();
          }}
          {...props}
        >
          {asChild ? (
            children
          ) : (
            <>
              {children}
              {external && <ExternalLink aria-label="새 탭에서 열림" />}
            </>
          )}
        </Comp>
      </li>
    );
  },
);
NavItem.displayName = 'NavItem';
