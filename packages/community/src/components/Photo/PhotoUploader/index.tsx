import { useRef, useState, type DragEvent } from 'react';
import {
  AlertCircle,
  ImagePlus,
  Loader2,
  Plus,
  RotateCw,
  X,
} from 'lucide-react';

import { Button, ConfirmDialog, Field, Input, Textarea } from '~/components/ui';
import { useCreatePhoto } from '~/hooks/queries/usePhotoQueries';
import useBlockBackgroundScroll from '~/hooks/useBlockBackgroundScroll';
import { cn } from '~/lib/utils';
import { Tag } from '~/services/types';
import PhotoTagPicker from '../PhotoTagPicker';
import { SHOT_FIELDS } from '../shotFields';
import usePhotoUploads, { MAX_COUNT, type UploadItem } from './usePhotoUploads';

type PhotoUploaderProps = {
  boardId: string;
  /** The album or board the photos go into, under the heading. */
  targetName: string;
  /** The board's tags. 별사진 has them; album boards have none. */
  tags?: Tag[];
  albumId?: number;
  onCreatePhoto: () => void;
  onCancel: () => void;
};

/**
 * 사진 올리기. Pick or drop photos; each uploads right away while you fill
 * in its info. Mobile covers the screen with the actions in the header;
 * desktop is a dialog with the photo on the left and the form on the right.
 */
export default function PhotoUploader({
  boardId,
  targetName,
  tags = [],
  albumId,
  onCreatePhoto,
  onCancel,
}: PhotoUploaderProps) {
  useBlockBackgroundScroll();
  const { items, add, remove, retry, updateInfo } = usePhotoUploads();
  const { mutateAsync: createPhoto, isPending: submitting } = useCreatePhoto();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedKey, setSelectedKey] = useState<string>();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const selected = items.find((item) => item.key === selectedKey) ?? items[0];
  const uploading = items.filter((item) => item.status === 'uploading').length;
  const failed = items.filter((item) => item.status === 'error').length;
  const canSubmit =
    items.length > 0 && uploading === 0 && failed === 0 && !submitting;

  const addFiles = (files: File[]) => {
    if (files.length === 0) return;
    setNotice(add(files));
  };

  const removeItem = (item: UploadItem) => {
    setNotice(null);
    if (item.key === selected?.key) {
      const index = items.indexOf(item);
      setSelectedKey((items[index + 1] ?? items[index - 1])?.key);
    }
    remove(item.key);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (submitting) return;
    addFiles(Array.from(e.dataTransfer.files));
  };

  const dragProps = {
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: handleDrop,
  };

  const requestLeave = () => {
    if (submitting) return;
    if (items.length > 0) setLeaveOpen(true);
    else onCancel();
  };

  const submit = async () => {
    if (!canSubmit) return;
    setError(false);
    try {
      await createPhoto({
        board_id: boardId,
        album_id: albumId,
        list: items.map((item) => ({
          ...item.info,
          title: item.info.title.trim(),
          // An empty date would be stored as an invalid date.
          date: item.info.date || undefined,
          img_url: item.imgUrl,
          thumbnail_url: item.thumbnailUrl,
        })),
      });
      onCreatePhoto();
    } catch (err) {
      console.error(err);
      setError(true);
    }
  };

  const submitLabel = items.length > 0 ? `올리기 ${items.length}` : '올리기';
  const status =
    uploading > 0
      ? `${items.length - uploading} / ${items.length}장 준비됨`
      : failed > 0
        ? `${failed}장을 올리지 못했어요`
        : null;

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      multiple
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        addFiles(Array.from(e.target.files ?? []));
        e.target.value = '';
      }}
    />
  );

  const pick = () => fileInputRef.current?.click();

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
              onClick={() => setSelectedKey(item.key)}
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
                  item.status !== 'done' && 'opacity-50',
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
            <button
              type="button"
              aria-label={`${i + 1}번째 사진 빼기`}
              onClick={() => removeItem(item)}
              className="absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full bg-navy-900 text-white shadow-sm"
            >
              <X className="size-3.5" strokeWidth={2.4} />
            </button>
          </li>
        );
      })}
      {items.length < MAX_COUNT && (
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

  const infoForm = selected && (
    <div className="flex flex-col gap-4 px-4 pt-1 pb-8 md:px-5 md:pt-5 md:pb-5">
      {selected.status === 'error' && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg bg-danger-soft py-2 pr-2 pl-3.5 text-label font-normal text-danger"
        >
          <span className="flex-1">이 사진을 올리지 못했어요.</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => retry(selected.key)}
          >
            <RotateCw className="size-4!" />
            다시 시도
          </Button>
        </div>
      )}
      <Field label="제목">
        <Input
          value={selected.info.title}
          maxLength={50}
          onChange={(e) => updateInfo(selected.key, { title: e.target.value })}
        />
      </Field>
      <Field label="설명">
        <Textarea
          rows={3}
          value={selected.info.text}
          onChange={(e) => updateInfo(selected.key, { text: e.target.value })}
        />
      </Field>

      <PhotoTagPicker
        tags={tags}
        selected={selected.info.tags}
        onChange={(next) => updateInfo(selected.key, { tags: next })}
      />

      <div
        role="group"
        aria-label="촬영 정보"
        className="flex flex-col gap-2.5 rounded-lg bg-gray-50 p-3.5"
      >
        <div className="text-label font-bold">촬영 정보</div>
        <div className="grid grid-cols-2 gap-x-2.5 gap-y-2">
          {SHOT_FIELDS.map((field) => (
            <label key={field.key} className="flex min-w-0 flex-col gap-1">
              <span className="text-caption text-gray-700">{field.label}</span>
              <Input
                type={field.key === 'date' ? 'date' : 'text'}
                placeholder={field.placeholder}
                value={selected.info[field.key] ?? ''}
                onChange={(e) =>
                  updateInfo(selected.key, { [field.key]: e.target.value })
                }
                className="h-10 min-w-0 px-2.5"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const messages = (notice || error) && (
    <div className="flex flex-col gap-2 px-4 pt-3 md:px-5">
      {notice && (
        <p
          role="alert"
          className="rounded-lg bg-info-soft px-3.5 py-2.5 text-label font-normal"
        >
          {notice}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-danger-soft px-3.5 py-2.5 text-label font-normal text-danger"
        >
          사진을 올리지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      )}
    </div>
  );

  return (
    // Mobile: a full-screen layer above the tab bar (z-30) and below
    // dialogs (z-40). Desktop: a dialog over a dimmed page.
    <div className="fixed inset-0 z-35 flex flex-col overflow-y-auto bg-surface text-fg md:items-center md:justify-center md:overflow-hidden md:bg-navy-950/48 md:p-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-uploader-title"
        className="flex flex-1 flex-col md:h-[min(760px,100%)] md:w-full md:max-w-[1080px] md:flex-none md:overflow-hidden md:rounded-xl md:bg-surface md:shadow-xl"
        {...dragProps}
      >
        <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-2 border-b border-gray-100 bg-surface pt-[max(0.5rem,env(safe-area-inset-top))] pr-3 pb-2 pl-1 md:static md:h-16 md:px-5 md:py-0">
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
              id="photo-uploader-title"
              className="text-[15px] font-semibold md:text-[17px] md:font-bold"
            >
              사진 올리기
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
            onClick={submit}
          >
            {submitLabel}
          </Button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col p-4 md:p-6">
            {messages}
            <button
              type="button"
              onClick={pick}
              className={cn(
                'mt-3 flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border-[1.5px] border-dashed border-gray-400 px-6 py-16 text-center hover:bg-gray-50 md:mt-0',
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
              <span className="text-caption text-fg-muted">
                한 번에 {MAX_COUNT}장, 합계 100MB까지
              </span>
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
              {messages}
              {infoForm}
            </div>
          </div>
        )}

        <div className="hidden shrink-0 items-center justify-between gap-2 border-t border-border px-5 py-3 md:flex">
          <span
            role="status"
            className={cn(
              'text-label font-normal',
              failed > 0 && uploading === 0 ? 'text-danger' : 'text-fg-muted',
            )}
          >
            {status}
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
              onClick={submit}
            >
              {submitLabel}
            </Button>
          </div>
        </div>
        {status && (
          <p
            className={cn(
              'sticky bottom-0 border-t border-border bg-surface px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] text-caption md:hidden',
              failed > 0 && uploading === 0 ? 'text-danger' : 'text-fg-muted',
            )}
          >
            {status}
          </p>
        )}
        {fileInput}
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
