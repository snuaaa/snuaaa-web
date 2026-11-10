import { FormEvent, useState } from 'react';
import { format } from 'date-fns';
import ShotInfoFields from '~/components/Photo/ShotInfoFields';
import { ShotField } from '~/components/Photo/shotFields';
import { Button, Field, Input, Textarea } from '~/components/ui';
import { useUpdateExhibitPhoto } from '~/hooks/queries/useExhibitionQueries';
import { ExhibitPhoto } from '~/services/types';
import PhotographerField, { Photographer } from '../PhotographerField';

type ExhibitPhotoEditFormProps = {
  photo: ExhibitPhoto;
  onCancel: () => void;
  onSaved: () => void;
};

/**
 * 작품 정보 수정. The photographer is a member picked from a search, or a
 * plain name for someone without an account. The image can't be replaced.
 */
export default function ExhibitPhotoEditForm({
  photo,
  onCancel,
  onSaved,
}: ExhibitPhotoEditFormProps) {
  const { exhibitPhoto } = photo;
  const { mutateAsync: updatePhoto, isPending } = useUpdateExhibitPhoto();

  const [order, setOrder] = useState(String(exhibitPhoto.order ?? ''));
  const [title, setTitle] = useState(photo.title);
  const [text, setText] = useState(photo.text ?? '');
  const [photographer, setPhotographer] = useState<Photographer | undefined>(
    exhibitPhoto.photographer ?? undefined,
  );
  const [photographerName, setPhotographerName] = useState(
    exhibitPhoto.photographer_alt ?? '',
  );
  const [shot, setShot] = useState<Record<ShotField, string>>({
    date: exhibitPhoto.date
      ? format(new Date(exhibitPhoto.date), 'yyyy-MM-dd')
      : '',
    location: exhibitPhoto.location ?? '',
    camera: exhibitPhoto.camera ?? '',
    lens: exhibitPhoto.lens ?? '',
    focal_length: exhibitPhoto.focal_length ?? '',
    f_stop: exhibitPhoto.f_stop ?? '',
    exposure_time: exhibitPhoto.exposure_time ?? '',
    iso: exhibitPhoto.iso ?? '',
  });
  const [error, setError] = useState(false);

  const orderNumber = Number(order);
  const orderValid = order !== '' && Number.isInteger(orderNumber);
  const canSave = title.trim().length > 0 && orderValid && !isPending;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    setError(false);
    try {
      await updatePhoto({
        exhibitPhoto_id: photo.content_id,
        data: {
          title: title.trim(),
          text,
          order: orderNumber,
          photographer,
          photographer_alt: photographer ? undefined : photographerName.trim(),
          ...shot,
          // An empty date would be stored as an invalid date.
          date: shot.date ? new Date(shot.date) : undefined,
        },
      });
      onSaved();
    } catch (err) {
      console.error(err);
      setError(true);
    }
  };

  return (
    <form
      aria-label="작품 정보 수정"
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
        <h1 className="text-base font-bold md:text-[17px]">작품 정보 수정</h1>
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

      <div className="flex flex-col gap-4 overflow-y-auto px-4 pt-4 pb-[calc(2rem+env(safe-area-inset-bottom))] md:flex-1 md:px-5 md:pt-[18px] md:pb-5">
        <p className="rounded-md bg-gray-50 px-3 py-2.5 text-caption leading-relaxed text-fg-muted">
          사진 파일은 바꿀 수 없어요. 다른 사진으로 바꾸려면 지우고 새로 올려
          주세요.
        </p>
        <div className="grid grid-cols-[96px_1fr] gap-2.5">
          <Field
            label="순서"
            required
            error={orderValid ? undefined : '숫자만'}
          >
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            />
          </Field>
          <Field
            label="제목"
            required
            error={title.trim() ? undefined : '제목을 입력해 주세요.'}
          >
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
        </div>
        <Field label="설명">
          <Textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </Field>

        <PhotographerField
          photographer={photographer}
          name={photographerName}
          onChange={(next) => {
            setPhotographer(next.photographer);
            setPhotographerName(next.name);
          }}
        />

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
