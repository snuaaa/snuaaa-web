import { FormEvent, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { Avatar, Button, Field, Input, Textarea } from '~/components/ui';
import { useUpdateExhibitPhoto } from '~/hooks/queries/useExhibitionQueries';
import { useSearchMini } from '~/hooks/queries/useUserQueries';
import { ExhibitPhotoInfo } from '~/services/ExhibitPhotoService';
import { ExhibitPhoto, User } from '~/services/types';

type ShotField =
  | 'location'
  | 'camera'
  | 'lens'
  | 'focal_length'
  | 'f_stop'
  | 'exposure_time'
  | 'iso';

const SHOT_FIELDS: { key: ShotField; label: string; placeholder?: string }[] = [
  { key: 'location', label: '장소' },
  { key: 'camera', label: '카메라' },
  { key: 'lens', label: '렌즈' },
  { key: 'focal_length', label: '초점거리', placeholder: 'mm' },
  { key: 'f_stop', label: '조리개', placeholder: 'f/' },
  { key: 'exposure_time', label: '노출', placeholder: '초' },
  { key: 'iso', label: 'ISO' },
];

/** Waits this long after typing before searching members. */
const SEARCH_DELAY = 300;

type Photographer = NonNullable<ExhibitPhotoInfo['photographer']>;

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
  const { mutateAsync: searchUsers } = useSearchMini();

  const [order, setOrder] = useState(String(exhibitPhoto.order ?? ''));
  const [title, setTitle] = useState(photo.title);
  const [text, setText] = useState(photo.text ?? '');
  const [photographer, setPhotographer] = useState<Photographer | undefined>(
    exhibitPhoto.photographer ?? undefined,
  );
  const [photographerName, setPhotographerName] = useState(
    exhibitPhoto.photographer_alt ?? '',
  );
  const [results, setResults] = useState<User[]>([]);
  const [date, setDate] = useState(
    exhibitPhoto.date ? format(new Date(exhibitPhoto.date), 'yyyy-MM-dd') : '',
  );
  const [shot, setShot] = useState<Record<ShotField, string>>({
    location: exhibitPhoto.location ?? '',
    camera: exhibitPhoto.camera ?? '',
    lens: exhibitPhoto.lens ?? '',
    focal_length: exhibitPhoto.focal_length ?? '',
    f_stop: exhibitPhoto.f_stop ?? '',
    exposure_time: exhibitPhoto.exposure_time ?? '',
    iso: exhibitPhoto.iso ?? '',
  });
  const [error, setError] = useState(false);

  // Suggest members while a name is typed and none is picked.
  useEffect(() => {
    const name = photographerName.trim();
    if (photographer || !name) {
      setResults([]);
      return;
    }
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const res = await searchUsers(name);
        if (active) setResults(res.userList);
      } catch (err) {
        console.error(err);
      }
    }, SEARCH_DELAY);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [photographerName, photographer, searchUsers]);

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
          // An empty date would be stored as an invalid date.
          date: date ? new Date(date) : undefined,
          ...shot,
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

      <div className="flex flex-col gap-4 overflow-y-auto px-4 pt-4 pb-8 md:flex-1 md:px-5 md:pt-[18px] md:pb-5">
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

        <div className="flex flex-col gap-2">
          <label htmlFor="exhibit-photographer" className="text-label">
            작가
          </label>
          {photographer ? (
            <div className="flex h-12 items-center gap-2.5 rounded-md border border-border px-3">
              <Avatar user={photographer} size={28} />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                {photographer.nickname}
              </span>
              <button
                type="button"
                aria-label="작가 지우기"
                onClick={() => {
                  setPhotographer(undefined);
                  setPhotographerName('');
                }}
                className="flex size-8 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Input
                id="exhibit-photographer"
                autoComplete="off"
                placeholder="회원 닉네임, 또는 이름"
                value={photographerName}
                onChange={(e) => setPhotographerName(e.target.value)}
              />
              {results.length > 0 && (
                <ul
                  aria-label="회원 검색 결과"
                  className="absolute inset-x-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-md border border-border bg-surface py-1 shadow-lg"
                >
                  {results.map((user) => (
                    <li key={user.user_uuid}>
                      <button
                        type="button"
                        onClick={() => {
                          setPhotographer(user);
                          setResults([]);
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-gray-50"
                      >
                        <Avatar user={user} size={28} />
                        <span className="truncate">{user.nickname}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <p className="text-caption text-fg-muted">
            회원을 고르면 작가 페이지로 이어져요. 회원이 아니면 이름만 적어
            두세요.
          </p>
        </div>

        <div
          role="group"
          aria-label="촬영 정보"
          className="flex flex-col gap-2.5 rounded-lg bg-gray-50 p-3.5"
        >
          <div className="text-label font-bold">촬영 정보</div>
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-2">
            <label className="flex min-w-0 flex-col gap-1">
              <span className="text-caption text-gray-700">촬영일</span>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 min-w-0 px-2.5"
              />
            </label>
            {SHOT_FIELDS.map((field) => (
              <label key={field.key} className="flex min-w-0 flex-col gap-1">
                <span className="text-caption text-gray-700">
                  {field.label}
                </span>
                <Input
                  placeholder={field.placeholder}
                  value={shot[field.key]}
                  onChange={(e) =>
                    setShot((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  className="h-10 min-w-0 px-2.5"
                />
              </label>
            ))}
          </div>
        </div>

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
