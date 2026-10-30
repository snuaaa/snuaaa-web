import { useEffect, useRef, useState } from 'react';

import ShotInfoFields from '~/components/Photo/ShotInfoFields';
import { ShotField } from '~/components/Photo/shotFields';
import UploaderShell, { ShellMessage } from '~/components/Photo/UploaderShell';
import { Field, Input, Textarea } from '~/components/ui';
import { useCreateExhibitPhoto } from '~/hooks/queries/useExhibitionQueries';
import PhotographerField, { Photographer } from './PhotographerField';

const MAX_COUNT = 20;
const MAX_TOTAL_SIZE = 100 * 1024 * 1024;

type WorkDraft = {
  title: string;
  text: string;
  order: string;
  photographer?: Photographer;
  photographerName: string;
  shot: Record<ShotField, string>;
};

type WorkItem = {
  key: string;
  file: File;
  preview: string;
  status: 'idle' | 'uploading' | 'error';
  info: WorkDraft;
};

const emptyShot = (): Record<ShotField, string> => ({
  date: '',
  location: '',
  camera: '',
  lens: '',
  focal_length: '',
  f_stop: '',
  exposure_time: '',
  iso: '',
});

let nextKey = 0;

type ExhibitPhotoUploaderProps = {
  boardId: string;
  exhibitionId: number;
  exhibitionNo: number;
  /** The order the first new work gets; the rest follow it. */
  nextOrder: number;
  onCreate: () => void;
  onCancel: () => void;
};

/**
 * 작품 올리기. The API takes one work per request with its file, so the
 * works go up one by one on 올리기. A work that went up leaves the list,
 * so after a failure 올리기 sends only the rest.
 */
export default function ExhibitPhotoUploader({
  boardId,
  exhibitionId,
  exhibitionNo,
  nextOrder,
  onCreate,
  onCancel,
}: ExhibitPhotoUploaderProps) {
  const { mutateAsync: createExhibitPhoto } = useCreateExhibitPhoto();
  const [items, setItems] = useState<WorkItem[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>();
  const [notice, setNotice] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  // Missing titles and orders show once 올리기 has been tried.
  const [touched, setTouched] = useState(false);

  const itemsRef = useRef(items);
  itemsRef.current = items;
  // Free the previews when the uploader closes.
  useEffect(
    () => () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    },
    [],
  );

  const selected = items.find((item) => item.key === selectedKey) ?? items[0];
  const orderValid = (item: WorkItem) =>
    item.info.order !== '' && Number.isInteger(Number(item.info.order));
  const isValid = (item: WorkItem) =>
    item.info.title.trim().length > 0 && orderValid(item);
  const invalid = items.filter((item) => !isValid(item)).length;
  const canSubmit = items.length > 0 && !submitting;

  const addFiles = (files: File[]) => {
    const images = files.filter((file) => file.type.startsWith('image/'));
    setNotice(null);
    if (images.length === 0) {
      if (files.length > 0) setNotice('사진 파일만 올릴 수 있어요.');
      return;
    }
    if (items.length + images.length > MAX_COUNT) {
      setNotice(`한 번에 ${MAX_COUNT}점까지 올릴 수 있어요.`);
      return;
    }
    const total = [...items.map((item) => item.file), ...images].reduce(
      (sum, file) => sum + file.size,
      0,
    );
    if (total > MAX_TOTAL_SIZE) {
      setNotice(
        '한 번에 합계 100MB까지 올릴 수 있어요. 몇 점을 빼고 나눠서 올려 주세요.',
      );
      return;
    }
    // Number the new works after the ones already picked.
    const lastOrder = items.reduce(
      (max, item) => Math.max(max, Number(item.info.order) || 0),
      nextOrder - 1,
    );
    setItems((prev) => [
      ...prev,
      ...images.map((file, i): WorkItem => ({
        key: `work-${nextKey++}`,
        file,
        preview: URL.createObjectURL(file),
        status: 'idle',
        info: {
          title: '',
          text: '',
          order: String(lastOrder + i + 1),
          photographerName: '',
          shot: emptyShot(),
        },
      })),
    ]);
    if (images.length < files.length) setNotice('사진이 아닌 파일은 뺐어요.');
  };

  const remove = (key: string) => {
    setNotice(null);
    const index = items.findIndex((item) => item.key === key);
    const item = items[index];
    if (!item) return;
    if (key === selected?.key) {
      setSelectedKey((items[index + 1] ?? items[index - 1])?.key);
    }
    URL.revokeObjectURL(item.preview);
    setItems((prev) => prev.filter((it) => it.key !== key));
  };

  const setStatus = (key: string, status: WorkItem['status']) =>
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, status } : item)),
    );

  const updateInfo = (key: string, info: Partial<WorkDraft>) =>
    setItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, info: { ...item.info, ...info } } : item,
      ),
    );

  const submit = async () => {
    if (!canSubmit) return;
    const firstInvalid = items.find((item) => !isValid(item));
    if (firstInvalid) {
      setTouched(true);
      setSelectedKey(firstInvalid.key);
      return;
    }
    setSubmitting(true);
    setFailed(false);
    setProgress({ done: 0, total: items.length });
    for (const item of items) {
      const { info } = item;
      setStatus(item.key, 'uploading');
      try {
        await createExhibitPhoto({
          exhibition_id: exhibitionId,
          data: {
            board_id: boardId,
            exhibition_no: exhibitionNo,
            exhibitPhoto: item.file,
            photoInfo: {
              title: info.title.trim(),
              text: info.text,
              order: Number(info.order),
              photographer: info.photographer,
              photographer_alt: info.photographer
                ? undefined
                : info.photographerName.trim(),
              ...info.shot,
              // An empty date would be stored as an invalid date.
              date: info.shot.date ? new Date(info.shot.date) : undefined,
            },
          },
        });
        URL.revokeObjectURL(item.preview);
        setItems((prev) => prev.filter((it) => it.key !== item.key));
        setProgress((prev) => ({ ...prev, done: prev.done + 1 }));
      } catch (err) {
        console.error(err);
        setStatus(item.key, 'error');
        setSelectedKey(item.key);
        setFailed(true);
        setSubmitting(false);
        return;
      }
    }
    setSubmitting(false);
    onCreate();
  };

  const status = submitting
    ? { text: `작품 올리는 중 (${progress.done} / ${progress.total})` }
    : touched && invalid > 0
      ? {
          text: `제목이나 순서가 빠진 작품이 ${invalid}점 있어요`,
          danger: true,
        }
      : null;

  return (
    <UploaderShell
      heading="작품 올리기"
      targetName={`제${exhibitionNo}회 천체사진전`}
      items={items}
      selectedKey={selected?.key}
      onSelect={setSelectedKey}
      onAddFiles={addFiles}
      onRemove={remove}
      maxCount={MAX_COUNT}
      limitText={`한 번에 ${MAX_COUNT}점, 합계 100MB까지`}
      messages={
        (notice || failed) && (
          <>
            {notice && <ShellMessage>{notice}</ShellMessage>}
            {failed && (
              <ShellMessage tone="danger">
                작품을 올리지 못했어요. 다시 올리기를 누르면 남은 작품만 올려요.
              </ShellMessage>
            )}
          </>
        )
      }
      status={status}
      submitLabel={items.length > 0 ? `올리기 ${items.length}` : '올리기'}
      canSubmit={canSubmit}
      submitting={submitting}
      onSubmit={submit}
      onCancel={onCancel}
    >
      {selected && (
        <fieldset
          disabled={submitting}
          className="flex flex-col gap-4 px-4 pt-1 pb-8 md:px-5 md:pt-5 md:pb-5"
        >
          <div className="grid grid-cols-[96px_1fr] gap-2.5">
            <Field
              label="순서"
              required
              error={touched && !orderValid(selected) ? '숫자만' : undefined}
            >
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                value={selected.info.order}
                onChange={(e) =>
                  updateInfo(selected.key, { order: e.target.value })
                }
              />
            </Field>
            <Field
              label="제목"
              required
              error={
                touched && !selected.info.title.trim()
                  ? '제목을 입력해 주세요.'
                  : undefined
              }
            >
              <Input
                value={selected.info.title}
                onChange={(e) =>
                  updateInfo(selected.key, { title: e.target.value })
                }
              />
            </Field>
          </div>
          <Field label="설명">
            <Textarea
              rows={3}
              value={selected.info.text}
              onChange={(e) =>
                updateInfo(selected.key, { text: e.target.value })
              }
            />
          </Field>
          <PhotographerField
            photographer={selected.info.photographer}
            name={selected.info.photographerName}
            onChange={(next) =>
              updateInfo(selected.key, {
                photographer: next.photographer,
                photographerName: next.name,
              })
            }
          />
          <ShotInfoFields
            values={selected.info.shot}
            onChange={(key, value) =>
              updateInfo(selected.key, {
                shot: { ...selected.info.shot, [key]: value },
              })
            }
          />
        </fieldset>
      )}
    </UploaderShell>
  );
}
