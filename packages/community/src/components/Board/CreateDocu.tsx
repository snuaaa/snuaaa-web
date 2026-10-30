import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import AttachmentField from '~/components/Post/AttachmentField';
import ComposerLayout, {
  type UploadProgress,
} from '~/components/Post/ComposerLayout';
import { useCreateFile } from '~/hooks/queries/useContentQueries';
import { docuKeys, useCreateDocument } from '~/hooks/queries/useDocuQueries';
import { cn } from '~/lib/utils';
import { Board } from '~/services/types';
import { currentGeneration } from './boardUtils';

type CreateDocuProps = {
  board: Board;
  /** `failedFiles`: attachments that didn't upload, to tell the author. */
  onCreate: (failedFiles: number) => void;
  onClose: () => void;
};

/**
 * 문서 등록: 회기, 분류, 제목, 설명 and at least one file. Uses the same
 * frame as 글쓰기, with a plain description instead of the editor.
 */
export default function CreateDocu({
  board,
  onCreate,
  onClose,
}: CreateDocuProps) {
  const queryClient = useQueryClient();
  const { mutateAsync: createDocument } = useCreateDocument();
  const { mutateAsync: createFile } = useCreateFile();

  const [generation, setGeneration] = useState(currentGeneration());
  const [categoryId, setCategoryId] = useState<string>();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generations = Array.from(
    { length: currentGeneration() },
    (_, i) => currentGeneration() - i,
  );

  const missing = {
    category: !categoryId,
    title: !title.trim(),
    files: files.length === 0,
  };
  const valid = !missing.category && !missing.title && !missing.files;

  const submit = async () => {
    setTouched(true);
    if (!valid || !categoryId || submitting) return;
    setError(null);
    setSubmitting(true);
    let contentId: number;
    try {
      const res = await createDocument({
        board_id: board.board_id,
        data: {
          title: title.trim(),
          text,
          generation,
          category_id: categoryId,
        },
      });
      contentId = res.data.content_id;
    } catch (err) {
      console.error(err);
      setError('문서를 등록하지 못했어요. 잠시 후 다시 시도해 주세요.');
      setSubmitting(false);
      return;
    }
    // The document exists now, so a failed file doesn't stop us: the
    // board tells the author, who can attach it again by editing.
    let failedFiles = 0;
    for (let i = 0; i < files.length; i++) {
      setProgress({ current: i + 1, total: files.length, percent: 0 });
      const formData = new FormData();
      formData.append('attachedFile', files[i]);
      try {
        await createFile({
          content_id: contentId,
          formData,
          onUploadProgress: (e) => {
            if (e.total) {
              const percent = Math.round((e.loaded / e.total) * 100);
              setProgress({ current: i + 1, total: files.length, percent });
            }
          },
        });
      } catch (err) {
        console.error(err);
        failedFiles += 1;
      }
    }
    // The list was refetched when the document was made, before its files.
    queryClient.invalidateQueries({ queryKey: docuKeys.list() });
    onCreate(failedFiles);
  };

  const fieldError = (show: boolean, message: string) =>
    touched && show ? (
      <p className="text-caption text-danger">{message}</p>
    ) : null;

  return (
    <ComposerLayout
      heading="문서 등록"
      boardName={board.board_name}
      progress={progress}
      error={error}
      submitLabel="등록"
      canSubmit={!submitting && (!touched || valid)}
      submitting={submitting}
      onSubmit={submit}
      leaveConfirm={
        title || text || categoryId || files.length > 0
          ? {
              title: '등록을 그만둘까요?',
              description: '적은 내용과 고른 파일이 사라져요.',
              cancelLabel: '계속 쓰기',
            }
          : null
      }
      onLeave={onClose}
    >
      <div className="flex flex-col gap-3 border-b border-gray-100 px-4 pt-4 pb-3.5 md:px-7 md:pt-5 md:pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* A native select keeps the long list of 회기 easy to scroll. */}
          <label className="relative flex h-[34px] shrink-0 items-center gap-1 rounded-full border border-primary bg-surface pr-2.5 pl-3 text-label font-semibold text-primary">
            {generation}대
            <ChevronDown className="size-3.5" strokeWidth={2.4} aria-hidden />
            <select
              aria-label="회기"
              value={generation}
              onChange={(e) => setGeneration(Number(e.target.value))}
              className="absolute inset-0 cursor-pointer opacity-0"
            >
              {generations.map((gen) => (
                <option key={gen} value={gen}>
                  {gen}대
                </option>
              ))}
            </select>
          </label>
          <div
            className="my-1 hidden h-6 w-px shrink-0 bg-border md:block"
            aria-hidden
          />
          <div
            role="radiogroup"
            aria-label="분류"
            className="flex flex-wrap gap-1.5"
          >
            {board.categories.map((cate) => {
              const selected = categoryId === cate.category_id;
              return (
                <button
                  key={cate.category_id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setCategoryId(cate.category_id)}
                  className={cn(
                    'flex h-[34px] items-center rounded-full border px-3.5 text-label transition-colors',
                    selected
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-surface font-medium text-gray-700 hover:border-gray-300',
                  )}
                >
                  {cate.category_name}
                </button>
              );
            })}
          </div>
        </div>
        {fieldError(missing.category, '분류를 골라 주세요.')}
      </div>

      <div className="px-4 md:p-0">
        <label htmlFor="docu-title" className="sr-only">
          제목
        </label>
        <input
          id="docu-title"
          value={title}
          maxLength={50}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          aria-invalid={touched && missing.title}
          className="h-13 w-full border-b border-gray-100 bg-transparent text-xl font-bold outline-none placeholder:text-gray-400 md:h-17 md:px-7 md:text-[22px]"
        />
        <div className="md:px-7">
          {fieldError(missing.title, '제목을 입력해 주세요.')}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 py-3 md:px-7 md:py-4">
        <label htmlFor="docu-text" className="sr-only">
          설명
        </label>
        <textarea
          id="docu-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="어떤 문서인지 적어 주세요"
          className="min-h-40 flex-1 resize-none bg-transparent text-body leading-relaxed outline-none placeholder:text-gray-400 md:min-h-48"
        />
      </div>

      <AttachmentField
        newFiles={files}
        onNewFilesChange={setFiles}
        disabled={submitting}
        required
        error={
          touched && missing.files
            ? '파일을 하나 이상 첨부해 주세요.'
            : undefined
        }
      />
    </ComposerLayout>
  );
}
