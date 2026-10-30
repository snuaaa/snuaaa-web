import { FormEvent, useState } from 'react';
import { format } from 'date-fns';
import { Button, Field, Input, Textarea } from '~/components/ui';
import { useUpdatePhoto } from '~/hooks/queries/usePhotoQueries';
import { UpdatePhotoRequest } from '~/services/PhotoService';
import { Photo, Tag } from '~/services/types';
import PhotoTagPicker from '../PhotoTagPicker';
import ShotInfoFields from '../ShotInfoFields';

type PhotoEditFormProps = {
  photo: Photo;
  /** The board's tags. 별사진 has them; album boards have none. */
  boardTags: Tag[];
  onCancel: () => void;
  onSaved: () => void;
};

/**
 * 사진 정보 수정. Mobile: a full screen with 취소 / 저장 in the header.
 * Desktop: the side panel next to the photo, buttons at the bottom.
 * The image itself can't be replaced.
 */
export default function PhotoEditForm({
  photo,
  boardTags,
  onCancel,
  onSaved,
}: PhotoEditFormProps) {
  const { mutateAsync: updatePhoto, isPending } = useUpdatePhoto(
    photo.content_id,
  );
  const [title, setTitle] = useState(photo.title);
  const [text, setText] = useState(photo.text ?? '');
  const [tags, setTags] = useState(photo.tags?.map((tag) => tag.tag_id) ?? []);
  const [shot, setShot] = useState<UpdatePhotoRequest['photo']>({
    date: photo.photo.date
      ? format(new Date(photo.photo.date), 'yyyy-MM-dd')
      : '',
    location: photo.photo.location ?? '',
    camera: photo.photo.camera ?? '',
    lens: photo.photo.lens ?? '',
    focal_length: photo.photo.focal_length ?? '',
    f_stop: photo.photo.f_stop ?? '',
    exposure_time: photo.photo.exposure_time ?? '',
    iso: photo.photo.iso ?? '',
  });
  const [error, setError] = useState(false);

  const canSave = title.trim().length > 0 && !isPending;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    setError(false);
    try {
      await updatePhoto({
        title: title.trim(),
        text,
        tags,
        // An empty date would be stored as an invalid date.
        photo: { ...shot, date: shot.date || undefined },
      });
      onSaved();
    } catch (err) {
      console.error(err);
      setError(true);
    }
  };

  return (
    <form
      aria-label="사진 정보 수정"
      onSubmit={submit}
      className="flex min-h-0 flex-1 flex-col bg-surface"
    >
      <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-gray-100 bg-surface px-1 md:static md:h-16 md:px-5">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="text-fg md:hidden"
        >
          취소
        </Button>
        <h1 className="text-base font-bold md:text-[17px]">사진 정보 수정</h1>
        <Button
          type="submit"
          variant="ghost"
          disabled={!canSave}
          loading={isPending}
          className="md:hidden"
        >
          저장
        </Button>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto px-4 pt-4 pb-8 md:flex-1 md:px-5 md:pt-[18px] md:pb-5">
        <p className="rounded-md bg-gray-50 px-3 py-2.5 text-caption leading-relaxed text-fg-muted">
          사진 파일은 바꿀 수 없어요. 다른 사진으로 바꾸려면 지우고 새로 올려
          주세요.
        </p>
        <Field
          label="제목"
          required
          error={title.trim() ? undefined : '제목을 입력해 주세요.'}
        >
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="설명">
          <Textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </Field>

        <PhotoTagPicker tags={boardTags} selected={tags} onChange={setTags} />

        <ShotInfoFields
          values={shot}
          onChange={(key, value) =>
            setShot((prev) => ({ ...prev, [key]: value }))
          }
        />

        {error && (
          <p role="alert" className="text-label font-normal text-danger">
            저장하지 못했어요. 잠시 후 다시 시도해 주세요.
          </p>
        )}
      </div>

      <div className="hidden justify-end gap-2 border-t border-border px-5 py-3 md:flex">
        <Button
          variant="secondary"
          size="sm"
          className="h-10"
          onClick={onCancel}
        >
          취소
        </Button>
        <Button
          type="submit"
          size="sm"
          className="h-10 px-[18px]"
          disabled={!canSave}
          loading={isPending}
        >
          저장
        </Button>
      </div>
    </form>
  );
}
