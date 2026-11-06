import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

/**
 * Board search shared by the post boards and the 사진 tab: the URL keeps
 * `keyword` and `type`, the input keeps a draft until it is submitted.
 */

export const MIN_KEYWORD_LENGTH = 2;

export const SEARCH_TYPES = [
  { value: 'all', label: '제목+내용' },
  { value: 'title', label: '제목' },
  { value: 'text', label: '내용' },
  { value: 'user', label: '글쓴이' },
] as const;
export type SearchType = (typeof SEARCH_TYPES)[number]['value'];

export const toSearchType = (value?: string): SearchType =>
  SEARCH_TYPES.find((option) => option.value === value)?.value ?? 'all';
export const searchTypeLabel = (type: SearchType) =>
  SEARCH_TYPES.find((option) => option.value === type)!.label;

export const KEYWORD_ERROR = `검색어는 ${MIN_KEYWORD_LENGTH}글자 이상 입력해 주세요.`;

// Recent searches are a per-browser convenience, shared by every board.
const RECENT_SEARCHES_KEY = 'aaa:recentSearches';
const MAX_RECENT_SEARCHES = 6;

function readRecentSearches(): string[] {
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(RECENT_SEARCHES_KEY) ?? '[]',
    );
    return Array.isArray(parsed)
      ? parsed.filter((v) => typeof v === 'string')
      : [];
  } catch {
    return [];
  }
}

function writeRecentSearches(keywords: string[]) {
  try {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(keywords));
  } catch {
    // Private mode or blocked storage: recent searches just aren't kept.
  }
}

function useRecentSearches() {
  const [recent, setRecent] = useState(readRecentSearches);
  const update = (next: string[]) => {
    setRecent(next);
    writeRecentSearches(next);
  };
  return {
    recent,
    add: (keyword: string) =>
      update(
        [keyword, ...recent.filter((k) => k !== keyword)].slice(
          0,
          MAX_RECENT_SEARCHES,
        ),
      ),
    remove: (keyword: string) => update(recent.filter((k) => k !== keyword)),
  };
}

/** Search state of a `/board/$board_id` page, kept in the URL. */
export function useBoardSearch() {
  const navigate = useNavigate({ from: '/board/$board_id' });
  const searchParams = useSearch({ from: '/board/$board_id' });
  const keyword = searchParams.keyword;
  const searchType = toSearchType(searchParams.type);
  const isSearching = !!keyword;

  const [draft, setDraftValue] = useState(keyword ?? '');
  const [draftType, setDraftType] = useState<SearchType>(searchType);
  const [keywordError, setKeywordError] = useState(false);
  const recentSearches = useRecentSearches();

  // Follow the URL when it changes from outside (back button, board switch).
  useEffect(() => {
    setDraftValue(keyword ?? '');
    setDraftType(searchType);
    setKeywordError(false);
  }, [keyword, searchType]);

  const search = (nextKeyword: string, nextType: SearchType) => {
    const trimmed = nextKeyword.trim();
    if (trimmed.length < MIN_KEYWORD_LENGTH) {
      setKeywordError(true);
      return;
    }
    setKeywordError(false);
    recentSearches.add(trimmed);
    navigate({
      search: (prev) => ({
        ...prev,
        keyword: trimmed,
        type: nextType,
        page: 1,
      }),
    });
  };

  const clearSearch = () => {
    navigate({
      search: ({ keyword: _k, type: _t, page: _p, ...rest }) => rest,
    });
  };

  return {
    keyword,
    searchType,
    isSearching,
    draft,
    setDraft: (value: string) => {
      setDraftValue(value);
      setKeywordError(false);
    },
    draftType,
    setDraftType,
    keywordError,
    recentSearches,
    search,
    submit: () => search(draft, draftType),
    /** Mobile segmented control: re-runs the search with the new scope. */
    changeType: (next: SearchType) => {
      setDraftType(next);
      if (draft.trim()) search(draft, next);
    },
    clearSearch,
  };
}

export type BoardSearchState = ReturnType<typeof useBoardSearch>;
