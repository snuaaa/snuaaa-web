import { useState } from 'react';
import { RotateCw } from 'lucide-react';

import { Button, Field, Input, Textarea } from '~/components/ui';
import { useCreatePhoto } from '~/hooks/queries/usePhotoQueries';
import { Tag } from '~/services/types';
import PhotoTagPicker from '../PhotoTagPicker';
import ShotInfoFields from '../ShotInfoFields';
import UploaderShell, { ShellMessage } from '../UploaderShell';
import usePhotoUploads, { MAX_COUNT } from './usePhotoUploads';

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
 * 사진 올리기. Each photo uploads as soon as it's picked, while its info is
 * filled in; 올리기 then only sends the URLs and the info.
 */
export default function PhotoUploader({
  boardId,
  targetName,
  tags = [],
  albumId,
  onCreatePhoto,
  onCancel,
}: PhotoUploaderProps) {
  const { items, add, remove, retry, updateInfo } = usePhotoUploads();
  const { mutateAsync: createPhoto, isPending: submitting } = useCreatePhoto();

  const [selectedKey, setSelectedKey] = useState<string>();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const selected = items.find((item) => item.key === selectedKey) ?? items[0];
  const uploading = items.filter((item) => item.status === 'uploading').length;
  const failed = items.filter((item) => item.status === 'error').length;
  const canSubmit =
    items.length > 0 && uploading === 0 && failed === 0 && !submitting;

  const removeItem = (key: string) => {
    setNotice(null);
    if (key === selected?.key) {
      const index = items.findIndex((item) => item.key === key);
      setSelectedKey((items[index + 1] ?? items[index - 1])?.key);
    }
    remove(key);
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

  const status =
    uploading > 0
      ? { text: `${items.length - uploading} / ${items.length}장 준비됨` }
      : failed > 0
        ? { text: `${failed}장을 올리지 못했어요`, danger: true }
        : null;

  return (
    <UploaderShell
      heading="사진 올리기"
      targetName={targetName}
      items={items.map((item) => ({
        key: item.key,
        preview: item.preview,
        status: item.status === 'done' ? 'idle' : item.status,
      }))}
      selectedKey={selected?.key}
      onSelect={setSelectedKey}
      onAddFiles={(files) => files.length > 0 && setNotice(add(files))}
      onRemove={removeItem}
      maxCount={MAX_COUNT}
      limitText={`한 번에 ${MAX_COUNT}장, 합계 100MB까지`}
      messages={
        (notice || error) && (
          <>
            {notice && <ShellMessage>{notice}</ShellMessage>}
            {error && (
              <ShellMessage tone="danger">
                사진을 올리지 못했어요. 잠시 후 다시 시도해 주세요.
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
              onChange={(e) =>
                updateInfo(selected.key, { title: e.target.value })
              }
            />
          </Field>
          <Field label="설명">
            <Textarea
              rows={3}
              value={selected.info.text}
              onChange={(e) =>
                updateInfo(selected.key, { text: e.target.value })
              }
            />
          </Field>
          <PhotoTagPicker
            tags={tags}
            selected={selected.info.tags}
            onChange={(next) => updateInfo(selected.key, { tags: next })}
          />
          <ShotInfoFields
            values={selected.info}
            onChange={(key, value) =>
              updateInfo(selected.key, { [key]: value })
            }
          />
        </div>
      )}
    </UploaderShell>
  );
}
