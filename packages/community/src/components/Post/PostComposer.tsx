import { type ReactNode } from 'react';

import Editor from '~/components/Common/Editor';
import { File as AttachedFile } from '~/services/types';
import AttachmentField from './AttachmentField';
import ComposerLayout, {
  type LeaveConfirm,
  type UploadProgress,
} from './ComposerLayout';

export type { LeaveConfirm, UploadProgress };

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

/** 글쓰기 and 글 수정: a title, the editor and the attachments. */
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
  existingFiles,
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
  return (
    <ComposerLayout
      heading={heading}
      boardName={boardName}
      status={status}
      banner={banner}
      progress={progress}
      error={error}
      submitLabel={submitLabel}
      canSubmit={title.trim().length > 0 && !submitting}
      submitting={submitting}
      onSubmit={onSubmit}
      leaveConfirm={leaveConfirm}
      onLeave={onLeave}
    >
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

      <AttachmentField
        existingFiles={existingFiles}
        onRemoveExisting={onRemoveExisting}
        newFiles={newFiles}
        onNewFilesChange={onNewFilesChange}
        disabled={submitting}
      />
    </ComposerLayout>
  );
}
