import { FormEvent, useEffect, useRef, useState } from 'react';
import { format, parse } from 'date-fns';
import { ImagePlus, X } from 'lucide-react';

import { Button, Field, Input, Sheet, Textarea } from '~/components/ui';
import {
  useCreateExhibition,
  useUpdateExhibition,
} from '~/hooks/queries/useExhibitionQueries';
import { resolveImageUrl } from '~/lib/utils';
import { ExhibitionInfo } from '~/services/ExhibitionService';

type ExhibitionFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  /** Filled in as the 회차, usually the latest exhibition's plus one. */
  defaultNo?: number;
  /** Edits this exhibition instead of making a new one. */
  exhibition?: ExhibitionInfo;
  onSaved: () => void;
};

// Local midnight, as the date picker this replaces sent.
const toDate = (value: string) => parse(value, 'yyyy-MM-dd', new Date());
const toInputDate = (value?: Date | string) =>
  value ? format(new Date(value), 'yyyy-MM-dd') : '';

/**
 * 사진전 만들기 and 사진전 수정: 회차, 슬로건, 기간, 장소, 포스터 and a
 * description, all required. Editing starts from the exhibition's values and
 * keeps its poster unless a new one is picked. A bottom sheet on mobile, a
 * dialog on desktop.
 */
export default function ExhibitionFormSheet({
  open,
  onOpenChange,
  boardId,
  defaultNo,
  exhibition,
  onSaved,
}: ExhibitionFormSheetProps) {
  const isEdit = !!exhibition;
  const label = isEdit ? '사진전 수정' : '사진전 만들기';
  const { mutateAsync: createExhibition, isPending: creating } =
    useCreateExhibition();
  const { mutateAsync: updateExhibition, isPending: updating } =
    useUpdateExhibition();
  const saving = creating || updating;
  const posterInputRef = useRef<HTMLInputElement>(null);

  const [no, setNo] = useState('');
  const [slogan, setSlogan] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [place, setPlace] = useState('');
  const [text, setText] = useState('');
  const [poster, setPoster] = useState<File>();
  const [posterUrl, setPosterUrl] = useState<string>();
  // The saved poster, shown until it is removed or replaced.
  const [currentPoster, setCurrentPoster] = useState<string>();
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState(false);

  // Start blank, or from the exhibition being edited, each time it opens.
  useEffect(() => {
    if (!open) return;
    const info = exhibition?.exhibition;
    setNo(
      info ? String(info.exhibition_no) : defaultNo ? String(defaultNo) : '',
    );
    setSlogan(info?.slogan ?? '');
    setDateStart(toInputDate(info?.date_start));
    setDateEnd(toInputDate(info?.date_end));
    setPlace(info?.place ?? '');
    setText(exhibition?.text ?? '');
    setPoster(undefined);
    setCurrentPoster(
      info
        ? resolveImageUrl(info.poster_thumbnail_path || info.poster_path)
        : undefined,
    );
    setTouched(false);
    setError(false);
  }, [open, defaultNo, exhibition]);

  useEffect(() => {
    if (!poster) {
      setPosterUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(poster);
    setPosterUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [poster]);

  const errors = {
    no:
      no !== '' && Number.isInteger(Number(no)) && Number(no) > 0
        ? undefined
        : '회차를 숫자로 적어 주세요.',
    slogan: slogan.trim() ? undefined : '슬로건을 입력해 주세요.',
    dates:
      !dateStart || !dateEnd
        ? '시작일과 종료일을 골라 주세요.'
        : dateEnd < dateStart
          ? '종료일이 시작일보다 빨라요.'
          : undefined,
    place: place.trim() ? undefined : '장소를 입력해 주세요.',
    poster: poster || currentPoster ? undefined : '포스터를 올려 주세요.',
    text: text.trim() ? undefined : '설명을 입력해 주세요.',
  };
  const valid = Object.values(errors).every((message) => !message);
  const show = (message?: string) => (touched ? message : undefined);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid || saving) return;
    setError(false);
    const fields = {
      text,
      exhibition_no: no,
      slogan: slogan.trim(),
      date_start: toDate(dateStart),
      date_end: toDate(dateEnd),
      place: place.trim(),
    };
    try {
      if (exhibition) {
        await updateExhibition({
          exhibition_id: exhibition.content_id,
          data: { ...fields, poster },
        });
      } else if (poster) {
        await createExhibition({
          board_id: boardId,
          data: { ...fields, title: '', poster },
        });
      } else {
        return;
      }
      onSaved();
    } catch (err) {
      console.error(err);
      setError(true);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => !saving && onOpenChange(next)}
      title={label}
      className="md:w-[520px]"
      footer={
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="hidden md:inline-flex"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button
            type="submit"
            form="exhibition-form"
            className="flex-1"
            disabled={touched && !valid}
            loading={saving}
          >
            {isEdit ? '저장' : '만들기'}
          </Button>
        </div>
      }
    >
      <form
        id="exhibition-form"
        aria-label={label}
        onSubmit={submit}
        className="flex flex-col gap-4 pb-1"
      >
        <div className="grid grid-cols-[96px_1fr] gap-2.5">
          <Field label="회차" required error={show(errors.no)}>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              value={no}
              onChange={(e) => setNo(e.target.value)}
            />
          </Field>
          <Field label="슬로건" required error={show(errors.slogan)}>
            <Input
              value={slogan}
              placeholder="예: 별이 머무는 자리"
              onChange={(e) => setSlogan(e.target.value)}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-2">
          <span id="exhibition-dates" className="text-label">
            기간 <span className="text-danger">*</span>
          </span>
          <div
            role="group"
            aria-labelledby="exhibition-dates"
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"
          >
            <Input
              type="date"
              aria-label="시작일"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="min-w-0"
            />
            <span className="text-fg-muted">~</span>
            <Input
              type="date"
              aria-label="종료일"
              value={dateEnd}
              min={dateStart || undefined}
              onChange={(e) => setDateEnd(e.target.value)}
              className="min-w-0"
            />
          </div>
          {show(errors.dates) && (
            <p className="text-caption text-danger">{errors.dates}</p>
          )}
        </div>

        <Field label="장소" required error={show(errors.place)}>
          <Input
            value={place}
            placeholder="예: 서울대학교 관정도서관 1층"
            onChange={(e) => setPlace(e.target.value)}
          />
        </Field>

        <div className="flex flex-col gap-2">
          <span className="text-label">
            포스터 <span className="text-danger">*</span>
          </span>
          {posterUrl || currentPoster ? (
            <div className="relative w-32 self-start">
              <img
                src={posterUrl || currentPoster}
                alt="포스터 미리보기"
                className="aspect-[3/4] w-full rounded-lg bg-gray-100 object-cover"
              />
              <button
                type="button"
                aria-label="포스터 빼기"
                onClick={() => {
                  setPoster(undefined);
                  setCurrentPoster(undefined);
                }}
                className="absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full bg-navy-900 text-white shadow-sm"
              >
                <X className="size-3.5" strokeWidth={2.4} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => posterInputRef.current?.click()}
              className="flex aspect-[3/4] w-32 flex-col items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-dashed border-gray-400 text-caption text-gray-700 hover:bg-gray-50"
            >
              <ImagePlus className="size-5" aria-hidden />
              포스터 고르기
            </button>
          )}
          <input
            ref={posterInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPoster(file);
              e.target.value = '';
            }}
          />
          {show(errors.poster) && (
            <p className="text-caption text-danger">{errors.poster}</p>
          )}
        </div>

        <Field label="설명" required error={show(errors.text)}>
          <Textarea
            rows={3}
            value={text}
            placeholder="사진전 소개를 적어 주세요"
            onChange={(e) => setText(e.target.value)}
          />
        </Field>

        {error && (
          <p role="alert" className="text-label font-normal text-danger">
            {isEdit
              ? '사진전을 수정하지 못했어요.'
              : '사진전을 만들지 못했어요.'}{' '}
            잠시 후 다시 시도해 주세요.
          </p>
        )}
      </form>
    </Sheet>
  );
}
