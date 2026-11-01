import { useRef, useState, type DragEvent } from 'react';
import { Paperclip, X } from 'lucide-react';

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

type AttachmentFieldProps = {
  existingFiles?: AttachedFile[];
  onRemoveExisting?: (fileId: number) => void;
  newFiles: File[];
  onNewFilesChange: (files: File[]) => void;
  disabled?: boolean;
  required?: boolean;
  /** Shown under the list, e.g. that a required file is missing. */
  error?: string;
};

/**
 * 첨부파일: up to 5 files, 20MB in total, picked or dropped. Files already
 * attached (when editing) are listed first.
 */
export default function AttachmentField({
  existingFiles = [],
  onRemoveExisting,
  newFiles,
  onNewFilesChange,
  disabled,
  required,
  error,
}: AttachmentFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const fileCount = existingFiles.length + newFiles.length;

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
    if (disabled) return;
    addFiles(Array.from(e.dataTransfer.files));
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
        disabled={disabled}
        onClick={onRemove}
        className="flex size-9 shrink-0 items-center justify-center rounded-md text-fg-muted hover:bg-gray-50"
      >
        <X className="size-4" strokeWidth={2.2} />
      </button>
    </li>
  );

  return (
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
          {required && <span className="text-danger"> *</span>}
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
      {(attachError || error) && (
        <p
          role="alert"
          className="rounded-md bg-danger-soft px-3 py-2.5 text-label leading-normal font-normal text-danger"
        >
          {attachError || error}
        </p>
      )}
      {fileCount < MAX_FILES && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className="flex h-11 items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed border-gray-400 text-sm font-semibold text-gray-700 hover:bg-gray-50 md:h-12"
        >
          <Paperclip className="size-4" aria-hidden />
          <span className="md:hidden">
            파일 추가 ({fileCount} / {MAX_FILES})
          </span>
          <span className="hidden md:inline">파일 선택 또는 끌어다 놓기</span>
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
  );
}
