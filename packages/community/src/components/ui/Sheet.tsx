import type { ComponentProps, ReactNode } from 'react';
import { Drawer } from 'vaul';
import { ViewportSize, useViewportSize } from '~/contexts/viewportSize';
import { cn } from '~/lib/utils';
import { Dialog, type DialogProps } from './Dialog';

type SheetProps = DialogProps;

/**
 * A bottom sheet on mobile and tablet, a centered dialog on desktop.
 * Use it for action menus and short forms. For a yes/no question, use
 * `ConfirmDialog`.
 */
export function Sheet(props: SheetProps) {
  const viewport = useViewportSize();
  return viewport === ViewportSize.Desktop ? (
    <Dialog {...props} />
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
        <Drawer.Overlay className="fixed inset-0 z-40 bg-navy-950/48" />
        <Drawer.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col rounded-t-xl bg-surface shadow-lg outline-none',
            className,
          )}
          {...(!description && { 'aria-describedby': undefined })}
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
