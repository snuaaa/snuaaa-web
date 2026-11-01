import { ChevronDown } from 'lucide-react';

import AttachmentField from '~/components/Post/AttachmentField';
import { currentGeneration } from '~/components/Board/boardUtils';
import { Category, File as AttachedFile } from '~/services/types';
import { Chip } from '~/components/ui';

type DocuFieldsProps = {
  generation: number;
  /** Left out when the 회기 can't change (the API doesn't edit it). */
  onGenerationChange?: (generation: number) => void;
  categories: Category[];
  categoryId?: string;
  onCategoryChange: (categoryId: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
  text: string;
  onTextChange: (text: string) => void;
  existingFiles?: AttachedFile[];
  onRemoveExisting?: (fileId: number) => void;
  newFiles: File[];
  onNewFilesChange: (files: File[]) => void;
  disabled?: boolean;
  errors: { category?: string; title?: string; files?: string };
};

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-caption text-danger">{message}</p> : null;

/**
 * 문서 등록 and 문서 수정: 회기, 분류, 제목, 설명 and the files, inside
 * `ComposerLayout`.
 */
export default function DocuFields({
  generation,
  onGenerationChange,
  categories,
  categoryId,
  onCategoryChange,
  title,
  onTitleChange,
  text,
  onTextChange,
  existingFiles,
  onRemoveExisting,
  newFiles,
  onNewFilesChange,
  disabled,
  errors,
}: DocuFieldsProps) {
  const generations = Array.from(
    { length: currentGeneration() },
    (_, i) => currentGeneration() - i,
  );

  return (
    <>
      <div className="flex flex-col gap-3 border-b border-gray-100 px-4 pt-4 pb-3.5 md:px-7 md:pt-5 md:pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {onGenerationChange ? (
            // A native select keeps the long list of 회기 easy to scroll.
            <label className="relative flex h-[34px] shrink-0 items-center gap-1 rounded-full border border-primary bg-surface pr-2.5 pl-3 text-label font-semibold text-primary">
              {generation}대
              <ChevronDown className="size-3.5" strokeWidth={2.4} aria-hidden />
              <select
                aria-label="회기"
                value={generation}
                onChange={(e) => onGenerationChange(Number(e.target.value))}
                className="absolute inset-0 cursor-pointer opacity-0"
              >
                {generations.map((gen) => (
                  <option key={gen} value={gen}>
                    {gen}대
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span className="flex h-[34px] shrink-0 items-center rounded-full bg-gray-100 px-3.5 text-label font-semibold text-gray-700">
              {generation}대
            </span>
          )}
          <div
            className="my-1 hidden h-6 w-px shrink-0 bg-border md:block"
            aria-hidden
          />
          <div
            role="radiogroup"
            aria-label="분류"
            className="flex flex-wrap gap-1.5"
          >
            {categories.map((cate) => {
              const selected = categoryId === cate.category_id;
              return (
                <Chip
                  key={cate.category_id}
                  role="radio"
                  aria-checked={selected}
                  selected={selected}
                  onClick={() => onCategoryChange(cate.category_id)}
                >
                  {cate.category_name}
                </Chip>
              );
            })}
          </div>
        </div>
        <FieldError message={errors.category} />
      </div>

      <div className="px-4 md:p-0">
        <label htmlFor="docu-title" className="sr-only">
          제목
        </label>
        <input
          id="docu-title"
          value={title}
          maxLength={50}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="제목"
          aria-invalid={!!errors.title}
          className="h-13 w-full border-b border-gray-100 bg-transparent text-xl font-bold outline-none placeholder:text-gray-400 md:h-17 md:px-7 md:text-[22px]"
        />
        <div className="md:px-7">
          <FieldError message={errors.title} />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 py-3 md:px-7 md:py-4">
        <label htmlFor="docu-text" className="sr-only">
          설명
        </label>
        <textarea
          id="docu-text"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="어떤 문서인지 적어 주세요"
          className="min-h-40 flex-1 resize-none bg-transparent text-body leading-relaxed outline-none placeholder:text-gray-400 md:min-h-48"
        />
      </div>

      <AttachmentField
        existingFiles={existingFiles}
        onRemoveExisting={onRemoveExisting}
        newFiles={newFiles}
        onNewFilesChange={onNewFilesChange}
        disabled={disabled}
        required
        error={errors.files}
      />
    </>
  );
}
