import { useState } from 'react';
import {
  Check,
  GalleryVertical,
  LayoutGrid,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Button, Sheet } from '~/components/ui';
import { cn } from '~/lib/utils';
import { Tag } from '~/services/types';

export type PhotoView = 'photo' | 'album';

/** 별사진 tags come in two groups, by `tag_type`. */
const TAG_GROUPS = [
  { type: 'M', name: '대상' },
  { type: 'T', name: '촬영 방식' },
] as const;

const groupTags = (tags: Tag[]) =>
  TAG_GROUPS.map((group) => ({
    ...group,
    tags: tags.filter((tag) => tag.tag_type === group.type),
  })).filter((group) => group.tags.length > 0);

const toggle = (list: string[], id: string) =>
  list.includes(id) ? list.filter((t) => t !== id) : [...list, id];

type ViewToggleProps = {
  view: PhotoView;
  onViewChange: (view: PhotoView) => void;
};

/** Mobile 사진 / 앨범 switch: two icon buttons. */
function ViewIconToggle({ view, onViewChange }: ViewToggleProps) {
  const options = [
    { value: 'photo', label: '사진 보기', icon: LayoutGrid },
    { value: 'album', label: '앨범 보기', icon: GalleryVertical },
  ] as const;
  return (
    <div className="flex shrink-0 rounded-md bg-gray-100 p-0.5">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          aria-pressed={view === value}
          onClick={() => onViewChange(value)}
          className={cn(
            'flex h-8 w-9 items-center justify-center rounded-[8px] transition-colors',
            view === value
              ? 'bg-surface text-primary shadow-sm'
              : 'text-fg-muted hover:text-fg',
          )}
        >
          <Icon className="size-4" strokeWidth={2} />
        </button>
      ))}
    </div>
  );
}

type FilterSheetProps = {
  tags: Tag[];
  selected: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (tags: string[]) => void;
};

/** Mobile filter: picks are applied only when 적용하기 is pressed. */
function FilterSheet({
  tags,
  selected,
  open,
  onOpenChange,
  onApply,
}: FilterSheetProps) {
  const [draft, setDraft] = useState(selected);
  const [wasOpen, setWasOpen] = useState(open);
  // Start from the applied tags each time the sheet opens.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(selected);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="필터"
      footer={
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="h-13"
            onClick={() => setDraft([])}
          >
            초기화
          </Button>
          <Button
            className="h-13 flex-1"
            onClick={() => {
              onApply(draft);
              onOpenChange(false);
            }}
          >
            {draft.length > 0 ? `적용하기 (${draft.length})` : '전체 보기'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-[22px] px-1 pt-1 pb-2">
        {groupTags(tags).map((group) => (
          <div key={group.type} className="flex flex-col gap-2.5">
            <div className="text-label text-fg-muted">{group.name}</div>
            <div className="flex flex-wrap gap-2">
              {group.tags.map((tag) => {
                const on = draft.includes(tag.tag_id);
                return (
                  <button
                    key={tag.tag_id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setDraft(toggle(draft, tag.tag_id))}
                    className={cn(
                      'flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors',
                      on
                        ? 'border-primary bg-primary font-semibold text-white'
                        : 'border-border bg-surface font-medium text-gray-700',
                    )}
                  >
                    {on && (
                      <Check
                        className="size-3.5"
                        strokeWidth={2.6}
                        aria-hidden
                      />
                    )}
                    {tag.tag_name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Sheet>
  );
}

type TagFilterProps = ViewToggleProps & {
  tags: Tag[];
  selected: string[];
  onChange: (tags: string[]) => void;
};

/**
 * Mobile row under the header: 필터 opens the sheet, applied tags show as
 * removable chips, and the icons switch between photos and albums.
 */
export function MobileTagFilterBar({
  tags,
  selected,
  onChange,
  view,
  onViewChange,
}: TagFilterProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const selectedTags = tags.filter((tag) => selected.includes(tag.tag_id));

  return (
    <div className="flex items-center gap-2 border-b border-gray-100 bg-surface py-2.5 pr-2 pl-4 md:hidden">
      {view === 'photo' && (
        <>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-haspopup="dialog"
            className="flex h-[34px] shrink-0 items-center gap-1.5 rounded-full border border-primary pr-3 pl-2.5 text-label text-primary"
          >
            <SlidersHorizontal className="size-4" strokeWidth={2} aria-hidden />
            필터
            {selected.length > 0 && (
              <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1.5 text-micro text-white">
                {selected.length}
              </span>
            )}
          </button>
          <ul className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none]">
            {selectedTags.map((tag) => (
              <li
                key={tag.tag_id}
                className="flex h-[34px] shrink-0 items-center gap-0.5 rounded-full bg-primary-soft pr-1.5 pl-3 text-label text-navy-700"
              >
                {tag.tag_name}
                <button
                  type="button"
                  aria-label={`${tag.tag_name} 필터 빼기`}
                  onClick={() => onChange(toggle(selected, tag.tag_id))}
                  className="flex size-6 items-center justify-center"
                >
                  <X className="size-3" strokeWidth={2.6} />
                </button>
              </li>
            ))}
          </ul>
          <FilterSheet
            tags={tags}
            selected={selected}
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            onApply={onChange}
          />
        </>
      )}
      {view === 'album' && <div className="flex-1" />}
      <ViewIconToggle view={view} onViewChange={onViewChange} />
    </div>
  );
}

/** Desktop sidebar: 사진 / 앨범 switch and tag checkboxes. */
export function DesktopTagFilter({
  tags,
  selected,
  onChange,
  view,
  onViewChange,
}: TagFilterProps) {
  return (
    <aside className="sticky top-25 hidden flex-col gap-[22px] md:flex">
      <div className="flex rounded-md bg-gray-200 p-[3px]">
        {(
          [
            ['photo', '사진'],
            ['album', '앨범'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={view === value}
            onClick={() => onViewChange(value)}
            className={cn(
              'h-[34px] flex-1 rounded-[8px] text-label transition-colors',
              view === value
                ? 'bg-surface text-primary shadow-sm'
                : 'font-normal text-fg-muted hover:text-fg',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {view === 'photo' && (
        <>
          {groupTags(tags).map((group) => (
            <fieldset key={group.type} className="flex flex-col gap-0.5">
              <legend className="pb-1.5 text-caption font-semibold text-fg-muted">
                {group.name}
              </legend>
              {group.tags.map((tag) => (
                <label
                  key={tag.tag_id}
                  className="flex h-[34px] cursor-pointer items-center gap-2.5 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(tag.tag_id)}
                    onChange={() => onChange(toggle(selected, tag.tag_id))}
                    className="m-0 size-[18px] accent-primary"
                  />
                  {tag.tag_name}
                </label>
              ))}
            </fieldset>
          ))}
          <Button
            variant="secondary"
            size="sm"
            disabled={selected.length === 0}
            onClick={() => onChange([])}
          >
            필터 초기화
          </Button>
        </>
      )}
    </aside>
  );
}
