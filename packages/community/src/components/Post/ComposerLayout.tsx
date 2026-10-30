import { useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

import { Button, ConfirmDialog } from '~/components/ui';

export type UploadProgress = {
  current: number;
  total: number;
  percent: number;
};

export type LeaveConfirm = {
  title: string;
  description: string;
  cancelLabel: string;
};

type ComposerLayoutProps = {
  heading: string;
  boardName: string;
  /** e.g. "임시저장됨 14:32", next to the board name. */
  status?: string;
  /** Shown above the form, e.g. the draft banner. */
  banner?: ReactNode;
  progress?: UploadProgress | null;
  error?: string | null;
  submitLabel: string;
  canSubmit: boolean;
  submitting: boolean;
  onSubmit: () => void;
  /** Asked before leaving; null leaves right away. */
  leaveConfirm: LeaveConfirm | null;
  onLeave: () => void;
  /** The form card. */
  children: ReactNode;
};

/**
 * The frame of 글쓰기 and 문서 등록. Mobile covers the screen (tab bar
 * included) with the actions in the header; desktop puts the form in a
 * card in an 860px column with the buttons below it.
 */
export default function ComposerLayout({
  heading,
  boardName,
  status,
  banner,
  progress,
  error,
  submitLabel,
  canSubmit,
  submitting,
  onSubmit,
  leaveConfirm,
  onLeave,
  children,
}: ComposerLayoutProps) {
  const [leaveOpen, setLeaveOpen] = useState(false);

  const requestLeave = () => {
    // Saving finishes by navigating, so leaving now would be undone.
    if (submitting) return;
    if (leaveConfirm) setLeaveOpen(true);
    else onLeave();
  };

  return (
    // Mobile: a full-screen layer above the tab bar (z-30) and below
    // dialogs (z-40), so the header and editor own the screen.
    <div className="fixed inset-0 z-35 flex flex-col overflow-y-auto bg-surface text-fg md:static md:z-auto md:flex-1 md:overflow-visible md:bg-transparent">
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-2 border-b border-gray-100 bg-surface pt-[max(0.5rem,env(safe-area-inset-top))] pr-3 pb-2 pl-1 md:hidden">
        <button
          type="button"
          aria-label="닫기"
          disabled={submitting}
          onClick={requestLeave}
          className="flex size-11 shrink-0 items-center justify-center disabled:opacity-40"
        >
          <X className="size-[22px]" />
        </button>
        <div className="flex min-w-0 flex-col items-center gap-px">
          <span className="text-[15px] font-semibold">{heading}</span>
          <span className="truncate text-micro text-fg-muted">
            {boardName}
            {status && ` · ${status}`}
          </span>
        </div>
        <Button
          size="sm"
          className="shrink-0"
          disabled={!canSubmit}
          loading={submitting}
          onClick={onSubmit}
        >
          {submitLabel}
        </Button>
      </header>

      <div className="mx-auto flex w-full max-w-[860px] flex-1 flex-col md:flex-none md:gap-3.5 md:px-6 md:py-7">
        <div className="hidden items-center justify-between md:flex">
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-2xl font-bold tracking-[-0.4px]">{heading}</h1>
            <span className="text-sm text-fg-muted">{boardName}</span>
          </div>
          {status && (
            <span className="text-caption text-fg-muted">{status}</span>
          )}
        </div>

        {banner}

        {progress && (
          <div
            role="status"
            className="mx-4 mt-3 flex flex-col gap-2 rounded-lg bg-info-soft px-3.5 py-3 text-label md:mx-0 md:mt-0"
          >
            <span>
              첨부파일 올리는 중 ({progress.current} / {progress.total})
            </span>
            <span className="h-1 overflow-hidden rounded-full bg-surface">
              <span
                className="block h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${progress.percent}%` }}
              />
            </span>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="mx-4 mt-3 rounded-lg bg-danger-soft px-3.5 py-3 text-label font-normal text-danger md:mx-0 md:mt-0"
          >
            {error}
          </p>
        )}

        <div className="flex flex-1 flex-col md:flex-none md:rounded-lg md:bg-surface md:shadow-sm">
          {children}
        </div>

        <div className="hidden justify-end gap-2 md:flex">
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

      {leaveConfirm && (
        <ConfirmDialog
          open={leaveOpen}
          onOpenChange={setLeaveOpen}
          title={leaveConfirm.title}
          description={leaveConfirm.description}
          cancelLabel={leaveConfirm.cancelLabel}
          confirmLabel="나가기"
          onConfirm={() => {
            setLeaveOpen(false);
            onLeave();
          }}
        />
      )}
    </div>
  );
}
