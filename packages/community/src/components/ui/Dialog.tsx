import type { ReactNode } from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Button } from './Button';

const overlayClassName = 'fixed inset-0 z-40 bg-navy-950/48';
const contentClassName =
  'fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-surface shadow-md outline-none';

export type DialogProps = {
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

/** A centered modal on every viewport. */
export function Dialog({
  open,
  onOpenChange,
  title,
  hideTitle,
  description,
  footer,
  className,
  children,
}: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={overlayClassName} />
        <DialogPrimitive.Content
          className={cn(contentClassName, className)}
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

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** `danger` for destructive actions such as 삭제. */
  tone?: 'primary' | 'danger';
  onConfirm: () => void;
  /** Keeps the dialog open with a spinner while the action runs. */
  loading?: boolean;
};

/**
 * A yes/no question (게시글을 삭제할까요?) as a centered modal on every
 * viewport. Unlike `Dialog`, clicking outside does not dismiss it.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  tone = 'primary',
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialogPrimitive.Root
      open={open}
      // Esc and 취소 can't close it while the action is still running.
      onOpenChange={(next) => !loading && onOpenChange(next)}
    >
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className={overlayClassName} />
        <AlertDialogPrimitive.Content
          className={cn(contentClassName, 'max-w-sm gap-5 p-6')}
          {...(!description && { 'aria-describedby': undefined })}
        >
          <div>
            <AlertDialogPrimitive.Title className="text-heading text-fg">
              {title}
            </AlertDialogPrimitive.Title>
            {description && (
              <AlertDialogPrimitive.Description className="mt-1.5 text-body text-fg-muted">
                {description}
              </AlertDialogPrimitive.Description>
            )}
          </div>
          <div className="flex gap-2">
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="secondary" className="flex-1" disabled={loading}>
                {cancelLabel}
              </Button>
            </AlertDialogPrimitive.Cancel>
            {/* Not an AlertDialog.Action, so the caller decides when to close. */}
            <Button
              variant={tone}
              className="flex-1"
              loading={loading}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
