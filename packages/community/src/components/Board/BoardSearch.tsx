import { FormEvent, ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { BackButton, SegmentedControl } from '~/components/ui';
import { cn } from '~/lib/utils';
import {
  BoardSearchState,
  KEYWORD_ERROR,
  SEARCH_TYPES,
  toSearchType,
} from './useBoardSearch';

/** Search controls of {@link useBoardSearch}. */

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
};

export function SearchField({
  value,
  onChange,
  onSubmit,
  autoFocus,
  className,
  inputClassName,
}: SearchFieldProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };
  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn(
        'flex min-w-0 items-center gap-2 rounded-md bg-surface-sunken px-3 text-fg-muted',
        className,
      )}
    >
      <Search className="size-4 shrink-0" strokeWidth={1.8} aria-hidden />
      <input
        type="search"
        aria-label="검색어"
        placeholder="검색어 입력"
        enterKeyHint="search"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-gray-400 [&::-webkit-search-cancel-button]:hidden',
          inputClassName,
        )}
      />
      {value && (
        <button
          type="button"
          aria-label="검색어 지우기"
          onClick={() => onChange('')}
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-300 text-white"
        >
          <X className="size-3.5" strokeWidth={2.6} />
        </button>
      )}
    </form>
  );
}

/** Desktop: the search scope select and the search field. */
export function DesktopSearchControls({
  search,
  fieldClassName,
}: {
  search: BoardSearchState;
  fieldClassName?: string;
}) {
  return (
    <>
      <select
        aria-label="검색 범위"
        value={search.draftType}
        onChange={(e) => search.setDraftType(toSearchType(e.target.value))}
        className="h-10 rounded-md border border-border bg-surface px-2.5 text-sm text-fg"
      >
        {SEARCH_TYPES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <SearchField
        value={search.draft}
        onChange={search.setDraft}
        onSubmit={search.submit}
        className={cn('h-10 w-[260px]', fieldClassName)}
        inputClassName="text-sm"
      />
    </>
  );
}

/**
 * Mobile search header that replaces the navy header: back, the field and
 * the scope switch, then the keyword error or `summary` (the result count).
 */
export function MobileSearchHeader({
  search,
  onClose,
  summary,
}: {
  search: BoardSearchState;
  onClose: () => void;
  summary?: ReactNode;
}) {
  return (
    <div className="sticky top-0 z-30 flex flex-col border-b border-gray-100 bg-surface">
      <div className="flex items-center gap-1 pt-safe-2 pr-4 pb-2 pl-1">
        <BackButton aria-label="검색 닫기" onClick={onClose} />
        <SearchField
          value={search.draft}
          onChange={search.setDraft}
          onSubmit={search.submit}
          autoFocus={!search.isSearching}
          className="h-11 flex-1"
          inputClassName="text-base"
        />
      </div>
      <div className="flex flex-col gap-2.5 px-4 pt-1.5 pb-3.5">
        <SegmentedControl
          aria-label="검색 범위"
          value={search.draftType}
          onValueChange={search.changeType}
          options={SEARCH_TYPES.map(({ value, label }) => ({ value, label }))}
          className="grid w-full grid-cols-4 rounded-md [&>button]:rounded-[8px] [&>button]:px-0"
        />
        {search.keywordError ? (
          <p className="text-label font-normal text-danger">{KEYWORD_ERROR}</p>
        ) : (
          search.isSearching && summary
        )}
      </div>
    </div>
  );
}

/** Mobile panel before a search runs: recent keywords and the length hint. */
export function RecentSearches({ search }: { search: BoardSearchState }) {
  const { recent, remove } = search.recentSearches;
  if (recent.length === 0 && search.keywordError) return null;
  return (
    <div className="mx-4 mt-7 flex flex-col gap-2.5 rounded-lg bg-gray-50 p-5">
      {recent.length > 0 && (
        <>
          <p className="text-label">최근 검색어</p>
          <ul className="flex flex-wrap gap-2">
            {recent.map((keyword) => (
              <li
                key={keyword}
                className="flex h-8 items-center rounded-full border border-border bg-surface pr-1.5 pl-3 text-label font-normal text-gray-700"
              >
                <button
                  type="button"
                  onClick={() => search.search(keyword, search.draftType)}
                >
                  {keyword}
                </button>
                <button
                  type="button"
                  aria-label={`${keyword} 삭제`}
                  onClick={() => remove(keyword)}
                  className="ml-1 flex size-[22px] items-center justify-center text-gray-400"
                >
                  <X className="size-3" strokeWidth={2.6} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {!search.keywordError && (
        <p className="text-caption text-fg-muted">{KEYWORD_ERROR}</p>
      )}
    </div>
  );
}
