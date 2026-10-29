import type { ComponentProps, ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Drawer } from 'vaul';
import { X } from 'lucide-react';
import { ViewportSize, useViewportSize } from '~/contexts/viewportSize';
import { cn } from '~/lib/utils';

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  /** Keeps the title for screen readers but hides it. */
  hideTitle?: boolean;
  description?: ReactNode;
  /** Sticky area under the content, e.g. the confirm button. */
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
};

const overlayClassName = 'fixed inset-0 z-40 bg-navy-950/48';

/**
 * A bottom sheet on mobile and tablet, a centered dialog on desktop.
 * Use it for menus, confirmations and short forms.
 */
export function Sheet(props: SheetProps) {
  const viewport = useViewportSize();
  return viewport === ViewportSize.Desktop ? (
    <DesktopDialog {...props} />
  ) : (
    <MobileSheet {...props} />
  );
}

function MobileSheet({
  open,
  onOpenChange,
  title,
  hideTitle,
  description,
  footer,
  className,
  children,
}: SheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className={overlayClassName} />
        <Drawer.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col rounded-t-xl bg-surface shadow-lg outline-none',
            className,
          )}
        >
          <div
            className="mx-auto mt-2 mb-3 h-1 w-10 shrink-0 rounded-full bg-gray-300"
            aria-hidden
          />
          <div className={cn('px-5 pb-2', hideTitle && 'sr-only')}>
            <Drawer.Title className="text-label text-fg-muted">
              {title}
            </Drawer.Title>
            {description && (
              <Drawer.Description className="mt-1 text-caption text-fg-muted">
                {description}
              </Drawer.Description>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4">{children}</div>
          <div className="px-4 pt-3 pb-[max(1.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function DesktopDialog({
  open,
  onOpenChange,
  title,
  hideTitle,
  description,
  footer,
  className,
  children,
}: SheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={overlayClassName} />
        <DialogPrimitive.Content
          className={cn(
            'fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-surface shadow-md outline-none',
            className,
          )}
          {...(!description && { 'aria-describedby': undefined })}
        >
          <div
            className={cn(
              'flex items-start justify-between gap-4 py-4 pr-3 pl-6',
              hideTitle && 'absolute top-0 right-0 p-3',
            )}
          >
            <div className={cn(hideTitle && 'sr-only')}>
              <DialogPrimitive.Title className="text-heading text-fg">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="mt-1 text-caption text-fg-muted">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close
              className="flex size-9 shrink-0 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100"
              aria-label="닫기"
            >
              <X className="size-5" />
            </DialogPrimitive.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4">{children}</div>
          {footer ? (
            <div className="flex justify-end gap-2 px-6 pt-3 pb-5">
              {footer}
            </div>
          ) : (
            <div className="h-4" />
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

type SheetActionProps = ComponentProps<'button'> & {
  icon?: ReactNode;
  tone?: 'default' | 'danger';
};

/** One row of an action menu inside a `Sheet` (수정, 링크 복사, 삭제 …). */
export function SheetAction({
  icon,
  tone = 'default',
  className,
  children,
  type = 'button',
  ...props
}: SheetActionProps) {
  return (
    <button
      type={type}
      className={cn(
        'flex h-13 w-full items-center gap-3.5 rounded-md px-2 text-left text-[15px] hover:bg-gray-50 [&_svg]:size-5 [&_svg]:shrink-0',
        tone === 'danger' ? 'text-danger' : 'text-fg',
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
