import { useRef, useState, type DragEvent, type ReactNode } from 'react';
import { Paperclip, X } from 'lucide-react';

import Editor from '~/components/Common/Editor';
import { Button, ConfirmDialog } from '~/components/ui';
import { cn } from '~/lib/utils';
import { File as AttachedFile } from '~/services/types';
import FileTypeBadge from './FileTypeBadge';
import { fileTypeFromName } from './fileType';

const MAX_FILES = 5;
const MAX_TOTAL_SIZE = 20 * 1024 * 1024;
const ACCEPT =
  '.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.hwp,.zip,.txt';
const ACCEPTED_EXTENSIONS = ACCEPT.split(',');

// `accept` only filters the file picker, so dropped files are checked here.
const isAccepted = (file: File) =>
  ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

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

type PostComposerProps = {
  heading: string;
  boardName: string;
  /** e.g. "임시저장됨 14:32", next to the board name. */
  status?: string;
  /** The draft banner, shown above the form. */
  banner?: ReactNode;
  title: string;
  onTitleChange: (title: string) => void;
  text: string;
  onTextChange: (text: string) => void;
  /** Change it to reload the editor with `text` (CKEditor keeps its own copy). */
  editorKey?: number;
  existingFiles?: AttachedFile[];
  onRemoveExisting?: (fileId: number) => void;
  newFiles: File[];
  onNewFilesChange: (files: File[]) => void;
  submitLabel: string;
  submitting: boolean;
  progress?: UploadProgress | null;
  error?: string | null;
  onSubmit: () => void;
  /** Asked before leaving; null leaves right away. */
  leaveConfirm: LeaveConfirm | null;
  onLeave: () => void;
};

/**
 * 글쓰기 and 글 수정. Mobile covers the screen (tab bar included) with the
 * actions in the header; desktop puts the form in a card in an 860px column.
 */
export default function PostComposer({
  heading,
  boardName,
  status,
  banner,
  title,
  onTitleChange,
  text,
  onTextChange,
  editorKey,
  existingFiles = [],
  onRemoveExisting,
  newFiles,
  onNewFilesChange,
  submitLabel,
  submitting,
  progress,
  error,
  onSubmit,
  leaveConfirm,
  onLeave,
}: PostComposerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [dragging, setDragging] = useState(false);

  const fileCount = existingFiles.length + newFiles.length;
  const canSubmit = title.trim().length > 0 && !submitting;

  const addFiles = (picked: File[]) => {
    if (picked.length === 0) return;
    setAttachError(null);
    const rejected = picked.find((file) => !isAccepted(file));
    if (rejected) {
      setAttachError(`${rejected.name}은 첨부할 수 없는 형식이에요.`);
      return;
    }
    if (fileCount + picked.length > MAX_FILES) {
      setAttachError(`파일은 최대 ${MAX_FILES}개까지 첨부할 수 있어요.`);
      return;
    }
    // Only new uploads count: the API doesn't report the size of files
    // already attached.
    let total = newFiles.reduce((sum, file) => sum + file.size, 0);
    const accepted: File[] = [];
    for (const file of picked) {
      if (total + file.size > MAX_TOTAL_SIZE) {
        setAttachError(
          `합계가 20MB를 넘어 ${file.name}을 첨부하지 못했어요. 용량을 줄이거나 다른 파일을 빼 주세요.`,
        );
        break;
      }
      total += file.size;
      accepted.push(file);
    }
    if (accepted.length > 0) onNewFilesChange([...newFiles, ...accepted]);
  };

  const removeNewFile = (index: number) => {
    setAttachError(null);
    onNewFilesChange(newFiles.filter((_, i) => i !== index));
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (submitting) return;
    addFiles(Array.from(e.dataTransfer.files));
  };

  const requestLeave = () => {
    // Saving finishes by navigating, so leaving now would be undone.
    if (submitting) return;
    if (leaveConfirm) setLeaveOpen(true);
    else onLeave();
  };

  const fileRow = (
    key: string,
    type: string | undefined,
    name: string,
    meta: string | null,
    onRemove: () => void,
  ) => (
    <li
      key={key}
      className="flex h-12 items-center gap-2.5 rounded-lg border border-border pr-1.5 pl-3"
    >
      <FileTypeBadge type={type} className="px-1.5 py-[3px]" />
      <span className="min-w-0 flex-1 truncate text-sm">{name}</span>
      {meta && <span className="text-caption text-fg-muted">{meta}</span>}
      <button
        type="button"
        aria-label={`${name} 첨부 빼기`}
        onClick={onRemove}
        className="flex size-9 shrink-0 items-center justify-center rounded-md text-fg-muted hover:bg-gray-50"
      >
        <X className="size-4" strokeWidth={2.2} />
      </button>
    </li>
  );

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
          <div className="px-4 pt-4 md:p-0">
            <label htmlFor="post-title" className="sr-only">
              제목
            </label>
            <input
              id="post-title"
              value={title}
              maxLength={50}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="제목"
              className="h-13 w-full border-b border-gray-100 bg-transparent text-xl font-bold outline-none placeholder:text-gray-400 md:h-17 md:rounded-t-lg md:px-7 md:text-[22px]"
            />
          </div>

          {/* CKEditor overrides: .post-composer-editor in index.css. */}
          <div className="post-composer-editor flex-1">
            <Editor
              key={editorKey}
              text={text}
              setText={onTextChange}
              readOnly={false}
            />
          </div>

          <div
            className={cn(
              'flex flex-col gap-2 border-t border-gray-100 px-4 py-3 md:gap-2.5 md:px-7 md:pt-4 md:pb-5',
              dragging && 'bg-info-soft',
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <div className="flex justify-between text-caption text-fg-muted">
              <span className="font-semibold text-fg">
                첨부파일 {fileCount}
              </span>
              <span>최대 5개 · 합계 20MB</span>
            </div>
            {fileCount > 0 && (
              <ul className="grid gap-2 md:grid-cols-2">
                {existingFiles.map((file) =>
                  fileRow(
                    `old-${file.file_id}`,
                    file.file_type,
                    file.original_name,
                    null,
                    () => onRemoveExisting?.(file.file_id),
                  ),
                )}
                {newFiles.map((file, i) =>
                  fileRow(
                    `new-${i}-${file.name}`,
                    fileTypeFromName(file.name),
                    file.name,
                    formatSize(file.size),
                    () => removeNewFile(i),
                  ),
                )}
              </ul>
            )}
            {attachError && (
              <p
                role="alert"
                className="rounded-md bg-danger-soft px-3 py-2.5 text-label leading-normal font-normal text-danger"
              >
                {attachError}
              </p>
            )}
            {fileCount < MAX_FILES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-11 items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed border-gray-400 text-sm font-semibold text-gray-700 hover:bg-gray-50 md:h-12"
              >
                <Paperclip className="size-4" aria-hidden />
                <span className="md:hidden">
                  파일 추가 ({fileCount} / {MAX_FILES})
                </span>
                <span className="hidden md:inline">
                  파일 선택 또는 끌어다 놓기
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => {
                addFiles(Array.from(e.target.files ?? []));
                e.target.value = '';
              }}
            />
          </div>
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
