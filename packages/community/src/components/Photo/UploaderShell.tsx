import { useRef, useState, type DragEvent, type ReactNode } from 'react';
import { AlertCircle, ImagePlus, Loader2, Plus, X } from 'lucide-react';

import { Button, ConfirmDialog } from '~/components/ui';
import useBlockBackgroundScroll from '~/hooks/useBlockBackgroundScroll';
import { cn } from '~/lib/utils';

export type ShellItem = {
  key: string;
  /** A local object URL of the picked file. */
  preview: string;
  status: 'idle' | 'uploading' | 'error';
};

type UploaderShellProps = {
  heading: string;
  /** The album, board or exhibition the photos go into. */
  targetName: string;
  items: ShellItem[];
  selectedKey?: string;
  onSelect: (key: string) => void;
  onAddFiles: (files: File[]) => void;
  onRemove: (key: string) => void;
  maxCount: number;
  /** e.g. "한 번에 50장, 합계 100MB까지" */
  limitText: string;
  /** Notices and errors, above the form. */
  messages?: ReactNode;
  /** The selected photo's form. */
  children?: ReactNode;
  /** Progress or a problem, next to the buttons. */
  status?: { text: string; danger?: boolean } | null;
  submitLabel: string;
  canSubmit: boolean;
  submitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
};

/**
 * The frame shared by 사진 올리기 and 작품 올리기: pick or drop photos,
 * then fill in each one's form. Mobile covers the screen with the actions
 * in the header; desktop is a dialog with the photo on the left and the
 * form on the right.
 */
export default function UploaderShell({
  heading,
  targetName,
  items,
  selectedKey,
  onSelect,
  onAddFiles,
  onRemove,
  maxCount,
  limitText,
  messages,
  children,
  status,
  submitLabel,
  canSubmit,
  submitting,
  onSubmit,
  onCancel,
}: UploaderShellProps) {
  useBlockBackgroundScroll();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const selected = items.find((item) => item.key === selectedKey);
  const pick = () => fileInputRef.current?.click();

  const dragProps = {
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (!submitting) onAddFiles(Array.from(e.dataTransfer.files));
    },
  };

  const requestLeave = () => {
    if (submitting) return;
    if (items.length > 0) setLeaveOpen(true);
    else onCancel();
  };

  const strip = (
    <ul
      aria-label="고른 사진"
      className="flex shrink-0 gap-2 overflow-x-auto px-4 py-3 md:px-5"
    >
      {items.map((item, i) => {
        const active = item.key === selected?.key;
        return (
          <li key={item.key} className="relative shrink-0">
            <button
              type="button"
              aria-label={`${i + 1}번째 사진`}
              aria-current={active || undefined}
              onClick={() => onSelect(item.key)}
              className={cn(
                'relative block size-16 overflow-hidden rounded-md bg-gray-100 md:size-[72px]',
                active && 'ring-2 ring-primary ring-offset-2',
              )}
            >
              <img
                src={item.preview}
                alt=""
                className={cn(
                  'size-full object-cover',
                  item.status !== 'idle' && 'opacity-50',
                )}
              />
              {item.status === 'uploading' && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Loader2
                    className="size-5 animate-spin text-white"
                    aria-label="올리는 중"
                  />
                </span>
              )}
              {item.status === 'error' && (
                <span className="absolute inset-0 flex items-center justify-center bg-danger/40">
                  <AlertCircle
                    className="size-5 text-white"
                    aria-label="올리지 못함"
                  />
                </span>
              )}
            </button>
            {!submitting && (
              <button
                type="button"
                aria-label={`${i + 1}번째 사진 빼기`}
                onClick={() => onRemove(item.key)}
                className="absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full bg-navy-900 text-white shadow-sm"
              >
                <X className="size-3.5" strokeWidth={2.4} />
              </button>
            )}
          </li>
        );
      })}
      {items.length < maxCount && !submitting && (
        <li className="shrink-0">
          <button
            type="button"
            aria-label="사진 추가"
            onClick={pick}
            className="flex size-16 items-center justify-center rounded-md border-[1.5px] border-dashed border-gray-400 text-gray-700 hover:bg-gray-50 md:size-[72px]"
          >
            <Plus className="size-5" />
          </button>
        </li>
      )}
    </ul>
  );

  return (
    // Mobile: a full-screen layer above the tab bar (z-30) and below
    // dialogs (z-40). Desktop: a dialog over a dimmed page.
    <div className="fixed inset-0 z-35 flex flex-col overflow-y-auto bg-surface text-fg md:items-center md:justify-center md:overflow-hidden md:bg-navy-950/48 md:p-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="uploader-title"
        className="flex flex-1 flex-col md:h-[min(760px,100%)] md:w-full md:max-w-page md:flex-none md:overflow-hidden md:rounded-xl md:bg-surface md:shadow-xl"
        {...dragProps}
      >
        <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-2 border-b border-gray-100 bg-surface pt-safe-2 pr-3 pb-2 pl-1 md:static md:h-16 md:px-5 md:py-0">
          <button
            type="button"
            aria-label="닫기"
            disabled={submitting}
            onClick={requestLeave}
            className="flex size-11 shrink-0 items-center justify-center disabled:opacity-40 md:order-last md:-mr-2.5"
          >
            <X className="size-[22px]" />
          </button>
          <div className="flex min-w-0 flex-col items-center gap-px md:flex-row md:items-baseline md:gap-2.5">
            <h1
              id="uploader-title"
              className="text-[15px] font-semibold md:text-[17px] md:font-bold"
            >
              {heading}
            </h1>
            <span className="truncate text-micro text-fg-muted md:text-sm">
              {targetName}
            </span>
          </div>
          <Button
            size="sm"
            className="shrink-0 md:hidden"
            disabled={!canSubmit}
            loading={submitting}
            onClick={onSubmit}
          >
            {submitLabel}
          </Button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col gap-3 p-4 md:p-6">
            {messages}
            <button
              type="button"
              onClick={pick}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border-[1.5px] border-dashed border-gray-400 px-6 py-16 text-center hover:bg-gray-50',
                dragging && 'border-primary bg-info-soft',
              )}
            >
              <span className="flex size-16 items-center justify-center rounded-[20px] bg-accent-soft text-primary">
                <ImagePlus className="size-7" strokeWidth={1.8} aria-hidden />
              </span>
              <span className="text-heading">
                <span className="md:hidden">사진 고르기</span>
                <span className="hidden md:inline">
                  사진을 고르거나 여기에 끌어다 놓으세요
                </span>
              </span>
              <span className="text-caption text-fg-muted">{limitText}</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col md:grid md:min-h-0 md:grid-cols-[minmax(0,1fr)_380px]">
            <div
              className={cn(
                'flex flex-col md:min-h-0 md:border-r md:border-border',
                dragging && 'bg-info-soft',
              )}
            >
              <div className="flex h-[40vh] items-center justify-center bg-navy-900 md:h-auto md:min-h-0 md:flex-1">
                {selected && (
                  <img
                    src={selected.preview}
                    alt=""
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </div>
              {strip}
            </div>
            <div className="flex flex-col md:min-h-0 md:overflow-y-auto">
              {messages && (
                <div className="flex flex-col gap-2 px-4 pt-3 md:px-5">
                  {messages}
                </div>
              )}
              {children}
            </div>
          </div>
        )}

        <div className="hidden shrink-0 items-center justify-between gap-2 border-t border-border px-5 py-3 md:flex">
          <span
            role="status"
            className={cn(
              'text-label font-normal',
              status?.danger ? 'text-danger' : 'text-fg-muted',
            )}
          >
            {status?.text}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={submitting}
              onClick={requestLeave}
            >
              취소
            </Button>
            <Button
              className="px-[22px]"
              disabled={!canSubmit}
              loading={submitting}
              onClick={onSubmit}
            >
              {submitLabel}
            </Button>
          </div>
        </div>
        {status && (
          <p
            className={cn(
              'sticky bottom-0 border-t border-border bg-surface px-4 py-2.5 pb-safe-2.5 text-caption md:hidden',
              status.danger ? 'text-danger' : 'text-fg-muted',
            )}
          >
            {status.text}
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            onAddFiles(Array.from(e.target.files ?? []));
            e.target.value = '';
          }}
        />
      </div>

      <ConfirmDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        title="올리지 않고 나갈까요?"
        description="고른 사진과 적은 정보가 사라져요."
        cancelLabel="계속 올리기"
        confirmLabel="나가기"
        onConfirm={() => {
          setLeaveOpen(false);
          onCancel();
        }}
      />
    </div>
  );
}

/** A notice or an error line for the shell's `messages`. */
export function ShellMessage({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'danger';
  children: ReactNode;
}) {
  return (
    <p
      role="alert"
      className={cn(
        'rounded-lg px-3.5 py-2.5 text-label font-normal',
        tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-info-soft',
      )}
    >
      {children}
    </p>
  );
}
