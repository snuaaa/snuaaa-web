import { FormEvent, useEffect, useState } from 'react';
import { User, Users } from 'lucide-react';

import { Button, Field, Input, Sheet, Textarea } from '~/components/ui';
import {
  useCreateAlbum,
  useUpdateAlbum,
} from '~/hooks/queries/useAlbumQueries';
import { cn } from '~/lib/utils';
import { Album, Category } from '~/services/types';

const KINDS = [
  {
    isPrivate: false,
    icon: Users,
    name: '그룹 앨범',
    desc: '누구나 사진을 올릴 수 있어요',
  },
  {
    isPrivate: true,
    icon: User,
    name: '개인 앨범',
    desc: '나만 사진을 올릴 수 있어요',
  },
] as const;

type AlbumFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories?: Category[];
  /** Saved into this board when making a new album. */
  boardId?: string;
  /** Edits this album instead of making one. */
  album?: Album;
  onSaved: () => void;
};

/**
 * 앨범 만들기 and 앨범 수정: the kind, a category when the board has them,
 * a title and a description. A bottom sheet on mobile, a dialog on desktop.
 */
export default function AlbumFormSheet({
  open,
  onOpenChange,
  categories = [],
  boardId,
  album,
  onSaved,
}: AlbumFormSheetProps) {
  const { mutateAsync: createAlbum, isPending: creating } = useCreateAlbum();
  const { mutateAsync: updateAlbum, isPending: updating } = useUpdateAlbum();
  const saving = creating || updating;

  const [isPrivate, setIsPrivate] = useState(false);
  const [categoryId, setCategoryId] = useState<string>();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState(false);

  // Start from the album, or blank, each time the sheet opens.
  useEffect(() => {
    if (!open) return;
    setIsPrivate(album?.album.is_private ?? false);
    setCategoryId(album?.category_id ?? undefined);
    setTitle(album?.title ?? '');
    setText(album?.text ?? '');
    setTouched(false);
    setError(false);
  }, [open, album]);

  const needsCategory = categories.length > 0;
  const titleMissing = title.trim().length === 0;
  const categoryMissing = needsCategory && !categoryId;
  const canSave = !titleMissing && !categoryMissing && !saving;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSave) return;
    setError(false);
    try {
      if (album) {
        await updateAlbum({
          album_id: album.content_id,
          data: {
            ...album,
            title: title.trim(),
            text,
            category_id: categoryId,
            album: { ...album.album, is_private: isPrivate },
          } as Album,
        });
      } else if (boardId) {
        await createAlbum({
          board_id: boardId,
          data: {
            title: title.trim(),
            text,
            category_id: categoryId,
            is_private: isPrivate,
          },
        });
      }
      onSaved();
    } catch (err) {
      console.error(err);
      setError(true);
    }
  };

  const heading = album ? '앨범 수정' : '앨범 만들기';

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => !saving && onOpenChange(next)}
      title={heading}
      className="md:w-[480px]"
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
            form="album-form"
            className="flex-1"
            disabled={touched && !canSave}
            loading={saving}
          >
            {album ? '저장' : '만들기'}
          </Button>
        </div>
      }
    >
      <form
        id="album-form"
        aria-label={heading}
        onSubmit={submit}
        className="flex flex-col gap-4 pb-1"
      >
        <div
          role="radiogroup"
          aria-label="앨범 종류"
          className="grid grid-cols-2 gap-2"
        >
          {KINDS.map((kind) => {
            const selected = isPrivate === kind.isPrivate;
            const Icon = kind.icon;
            return (
              <button
                key={kind.name}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setIsPrivate(kind.isPrivate)}
                className={cn(
                  'flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors',
                  selected
                    ? 'border-primary bg-primary-soft'
                    : 'border-border hover:border-gray-300',
                )}
              >
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  <Icon
                    className={cn(
                      'size-4',
                      selected ? 'text-primary' : 'text-gray-700',
                    )}
                    aria-hidden
                  />
                  {kind.name}
                </span>
                <span className="text-caption text-fg-muted">{kind.desc}</span>
              </button>
            );
          })}
        </div>

        {needsCategory && (
          <div className="flex flex-col gap-2">
            <span id="album-category" className="text-label">
              분류 <span className="text-danger">*</span>
            </span>
            <div
              role="radiogroup"
              aria-labelledby="album-category"
              className="flex flex-wrap gap-1.5"
            >
              {categories.map((cate) => {
                const selected = categoryId === cate.category_id;
                return (
                  <button
                    key={cate.category_id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setCategoryId(cate.category_id)}
                    className={cn(
                      'flex h-9 items-center rounded-full border px-3.5 text-label transition-colors md:h-[34px]',
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
            {touched && categoryMissing && (
              <p className="text-caption text-danger">분류를 골라 주세요.</p>
            )}
          </div>
        )}

        <Field
          label="제목"
          required
          error={touched && titleMissing ? '제목을 입력해 주세요.' : undefined}
        >
          <Input
            value={title}
            maxLength={50}
            placeholder="예: 2026 가을 관측회"
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field label="설명">
          <Textarea
            rows={3}
            value={text}
            placeholder="어떤 사진을 모으는 앨범인지 적어 주세요"
            onChange={(e) => setText(e.target.value)}
          />
        </Field>

        {error && (
          <p role="alert" className="text-label font-normal text-danger">
            {album ? '저장하지' : '앨범을 만들지'} 못했어요. 잠시 후 다시 시도해
            주세요.
          </p>
        )}
      </form>
    </Sheet>
  );
}
