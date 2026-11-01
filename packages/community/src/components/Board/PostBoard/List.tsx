import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { Heart, MessageSquare, PenLine, Search, X } from 'lucide-react';
import {
  Avatar,
  BackButton,
  Button,
  EmptyState,
  Fab,
  Pagination,
  SegmentedControl,
  Skeleton,
} from '~/components/ui';
import { useAuth } from '~/contexts/auth';
import { ViewportSize, useViewportSize } from '~/contexts/viewportSize';
import { usePostList } from '~/hooks/queries/usePostQueries';
import { cn } from '~/lib/utils';
import { Board, Content } from '~/services/types';
import BoardLayout from '../BoardLayout';
import Highlight from '../Highlight';
import { NewDot } from '../ListParts';
import {
  canWrite,
  findSnippet,
  formatListDate,
  isNewPost,
  plainText,
} from '../boardUtils';

const PAGE_SIZE = 10;
const MIN_KEYWORD_LENGTH = 2;

const SEARCH_TYPES = [
  { value: 'all', label: '제목+내용' },
  { value: 'title', label: '제목' },
  { value: 'text', label: '내용' },
  { value: 'user', label: '글쓴이' },
] as const;
type SearchType = (typeof SEARCH_TYPES)[number]['value'];

const toSearchType = (value?: string): SearchType =>
  SEARCH_TYPES.find((option) => option.value === value)?.value ?? 'all';
const searchTypeLabel = (type: SearchType) =>
  SEARCH_TYPES.find((option) => option.value === type)!.label;

const KEYWORD_ERROR = `검색어는 ${MIN_KEYWORD_LENGTH}글자 이상 입력해 주세요.`;

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

function Counts({ post }: { post: Content }) {
  return (
    <>
      <span className="flex items-center gap-[3px]">
        <Heart className="size-3.5" aria-label="추천" />
        {post.like_num}
      </span>
      <span className="ml-1.5 flex items-center gap-[3px]">
        <MessageSquare className="size-3.5" aria-label="댓글" />
        {post.comment_num}
      </span>
    </>
  );
}

const postLinkProps = (post: Content) =>
  ({
    to: '/post/$post_id',
    params: { post_id: String(post.content_id) },
  }) as const;

function MobilePostRow({ post }: { post: Content }) {
  return (
    <li className="border-b border-gray-100">
      <Link
        {...postLinkProps(post)}
        className="flex flex-col gap-1.5 py-3.5 active:bg-gray-50"
      >
        <span className="flex items-start gap-1.5">
          {isNewPost(post.createdAt) && (
            <span className="mt-[9px]">
              <NewDot />
            </span>
          )}
          <span className="line-clamp-2 text-body font-medium leading-[1.45]">
            {post.title}
          </span>
        </span>
        <span className="flex items-center gap-1.5 text-caption text-fg-muted">
          <Avatar user={post.user} size={20} />
          <span className="truncate">{post.user.nickname}</span>
          <span aria-hidden>·</span>
          <span className="shrink-0">{formatListDate(post.createdAt)}</span>
          <span className="flex-1" />
          <Counts post={post} />
        </span>
      </Link>
    </li>
  );
}

function MobileSearchRow({
  post,
  keyword,
  type,
}: {
  post: Content;
  keyword: string;
  type: SearchType;
}) {
  const snippet =
    (type === 'all' || type === 'text') && post.text
      ? findSnippet(plainText(post.text), keyword)
      : null;
  return (
    <li className="border-b border-gray-100">
      <Link
        {...postLinkProps(post)}
        className="flex flex-col gap-1.5 py-3.5 active:bg-gray-50"
      >
        <span className="text-body font-medium leading-[1.45]">
          <Highlight
            text={post.title}
            keyword={type === 'user' ? undefined : keyword}
          />
        </span>
        {snippet && (
          <span className="line-clamp-2 text-label font-normal leading-relaxed text-gray-700">
            <Highlight text={snippet} keyword={keyword} />
          </span>
        )}
        <span className="flex items-center gap-1.5 text-caption text-fg-muted">
          <span>
            <Highlight
              text={post.user.nickname}
              keyword={type === 'user' ? keyword : undefined}
            />
          </span>
          <span aria-hidden>·</span>
          <span>{formatListDate(post.createdAt)}</span>
          <span aria-hidden>·</span>
          <span>댓글 {post.comment_num}</span>
        </span>
      </Link>
    </li>
  );
}

const desktopColumns =
  'grid grid-cols-[minmax(0,1fr)_120px_90px_60px_60px] items-center gap-4 px-5';

function DesktopPostRow({
  post,
  keyword,
  type,
}: {
  post: Content;
  keyword?: string;
  type: SearchType;
}) {
  return (
    <li className="border-b border-gray-100 last:border-b-0">
      <Link
        {...postLinkProps(post)}
        className={cn(desktopColumns, 'h-13 text-sm hover:bg-gray-50')}
      >
        <span className="flex min-w-0 items-center gap-2">
          {isNewPost(post.createdAt) && <NewDot />}
          <span className="truncate font-medium">
            <Highlight
              text={post.title}
              keyword={type === 'user' ? undefined : keyword}
            />
          </span>
        </span>
        <span className="flex min-w-0 items-center gap-1.5 text-label font-normal text-gray-700">
          <Avatar user={post.user} size={20} />
          <span className="truncate">
            <Highlight
              text={post.user.nickname}
              keyword={type === 'user' ? keyword : undefined}
            />
          </span>
        </span>
        <span className="text-label font-normal text-fg-muted">
          {formatListDate(post.createdAt)}
        </span>
        <span className="text-right text-label font-normal text-fg-muted tabular-nums">
          {post.like_num}
        </span>
        <span className="text-right text-label font-normal text-fg-muted tabular-nums">
          {post.comment_num}
        </span>
      </Link>
    </li>
  );
}

function MobileSkeletonRow() {
  return (
    <li className="flex flex-col gap-2.5 border-b border-gray-100 py-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/3" />
    </li>
  );
}

function DesktopSkeletonRow() {
  return (
    <li className={cn(desktopColumns, 'h-13 border-b border-gray-100')}>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-12" />
      <span />
      <span />
    </li>
  );
}

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
};

function SearchField({
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

type Props = {
  boardInfo: Board;
  onClickCreate: () => void;
};

const ListPost = ({ boardInfo, onClickCreate }: Props) => {
  const navigate = useNavigate({ from: '/board/$board_id' });
  const searchParams = useSearch({ from: '/board/$board_id' });
  const page = Number(searchParams.page ?? 1);
  const keyword = searchParams.keyword;
  const searchType = toSearchType(searchParams.type);
  const isSearching = !!keyword;

  const isDesktop = useViewportSize() === ViewportSize.Desktop;
  const {
    authInfo: {
      user: { grade },
    },
  } = useAuth();
  const writable = canWrite(boardInfo, grade);

  const { data, isLoading, isError, refetch } = usePostList({
    board_id: boardInfo.board_id,
    search_type: isSearching ? searchType : undefined,
    search_keyword: keyword,
    offset: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
  });

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const showMobileSearch = !isDesktop && (mobileSearchOpen || isSearching);

  const [draft, setDraft] = useState(keyword ?? '');
  const [draftType, setDraftType] = useState<SearchType>(searchType);
  const [keywordError, setKeywordError] = useState(false);
  const recentSearches = useRecentSearches();

  // Follow the URL when it changes from outside (back button, board switch).
  useEffect(() => {
    setDraft(keyword ?? '');
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

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    if (isSearching) clearSearch();
  };

  const handleTypeChange = (next: SearchType) => {
    setDraftType(next);
    if (draft.trim()) search(draft, next);
  };

  const goToPage = (next: number) => {
    navigate({ search: (prev) => ({ ...prev, page: next }) });
  };

  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0;
  const posts = data?.rows ?? [];

  const emptyMessage = isSearching ? (
    <EmptyState
      title="검색 결과가 없어요"
      description="다른 검색어나 검색 범위로 찾아보세요."
    />
  ) : (
    <EmptyState
      title="아직 글이 없어요"
      description={writable ? '첫 글을 남겨 보세요.' : undefined}
    />
  );

  const errorMessage = (
    <EmptyState
      title="글을 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
      action={
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          다시 시도
        </Button>
      }
    />
  );

  const writeAction = writable ? (
    <Button onClick={onClickCreate} className="[&_svg]:text-accent">
      <PenLine className="size-[18px]!" />
      글쓰기
    </Button>
  ) : null;

  if (isDesktop) {
    return (
      <BoardLayout board={boardInfo} action={writeAction}>
        <div className="flex flex-col rounded-lg bg-surface shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-3.5">
            <div className="flex min-w-0 flex-1 items-center gap-2 text-label font-normal text-fg-muted">
              {keywordError ? (
                <span className="text-danger">{KEYWORD_ERROR}</span>
              ) : isSearching ? (
                <>
                  <span className="truncate">
                    ‘{keyword}’ {searchTypeLabel(searchType)} 검색 결과{' '}
                    <b className="font-semibold text-fg">{data?.count ?? 0}</b>
                    개
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={clearSearch}
                  >
                    검색 해제
                  </Button>
                </>
              ) : (
                <span>
                  전체{' '}
                  <b className="font-semibold text-fg">{data?.count ?? 0}</b>개
                </span>
              )}
            </div>
            <select
              aria-label="검색 범위"
              value={draftType}
              onChange={(e) => setDraftType(toSearchType(e.target.value))}
              className="h-10 rounded-md border border-border bg-surface px-2.5 text-sm text-fg"
            >
              {SEARCH_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <SearchField
              value={draft}
              onChange={(value) => {
                setDraft(value);
                setKeywordError(false);
              }}
              onSubmit={() => search(draft, draftType)}
              className="h-10 w-[260px]"
              inputClassName="text-sm"
            />
          </div>
          <div
            className={cn(
              desktopColumns,
              'border-b border-gray-100 py-2.5 text-caption font-semibold text-fg-muted',
            )}
            aria-hidden
          >
            <span>제목</span>
            <span>작성자</span>
            <span>작성일</span>
            <span className="text-right">추천</span>
            <span className="text-right">댓글</span>
          </div>
          {isError ? (
            errorMessage
          ) : isLoading || !data ? (
            <ul>
              {Array.from({ length: PAGE_SIZE }, (_, i) => (
                <DesktopSkeletonRow key={i} />
              ))}
            </ul>
          ) : posts.length === 0 ? (
            emptyMessage
          ) : (
            <ul>
              {posts.map((post) => (
                <DesktopPostRow
                  key={post.content_id}
                  post={post}
                  keyword={keyword}
                  type={searchType}
                />
              ))}
            </ul>
          )}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={goToPage}
            className="border-t border-gray-100 p-4"
          />
        </div>
      </BoardLayout>
    );
  }

  const mobileSearchHeader = (
    <div className="sticky top-0 z-30 flex flex-col border-b border-gray-100 bg-surface">
      <div className="flex items-center gap-1 pt-safe-2 pr-4 pb-2 pl-1">
        <BackButton aria-label="검색 닫기" onClick={closeMobileSearch} />
        <SearchField
          value={draft}
          onChange={(value) => {
            setDraft(value);
            setKeywordError(false);
          }}
          onSubmit={() => search(draft, draftType)}
          autoFocus={!isSearching}
          className="h-11 flex-1"
          inputClassName="text-base"
        />
      </div>
      <div className="flex flex-col gap-2.5 px-4 pt-1.5 pb-3.5">
        <SegmentedControl
          aria-label="검색 범위"
          value={draftType}
          onValueChange={handleTypeChange}
          options={SEARCH_TYPES.map(({ value, label }) => ({ value, label }))}
          className="grid w-full grid-cols-4 rounded-md [&>button]:rounded-[8px] [&>button]:px-0"
        />
        {keywordError ? (
          <p className="text-label font-normal text-danger">{KEYWORD_ERROR}</p>
        ) : (
          isSearching && (
            <p className="text-label font-normal text-fg-muted">
              {boardInfo.board_name}에서{' '}
              <b className="font-semibold text-fg">
                {searchTypeLabel(searchType)}
              </b>{' '}
              검색 결과{' '}
              <b className="font-semibold text-fg">{data?.count ?? 0}건</b>
            </p>
          )
        )}
      </div>
    </div>
  );

  if (showMobileSearch) {
    return (
      <BoardLayout board={boardInfo} mobileHeader={mobileSearchHeader}>
        <div className="flex flex-1 flex-col bg-surface">
          {!isSearching ? (
            (recentSearches.recent.length > 0 || !keywordError) && (
              <div className="mx-4 mt-7 flex flex-col gap-2.5 rounded-lg bg-gray-50 p-5">
                {recentSearches.recent.length > 0 && (
                  <>
                    <p className="text-label">최근 검색어</p>
                    <ul className="flex flex-wrap gap-2">
                      {recentSearches.recent.map((recent) => (
                        <li
                          key={recent}
                          className="flex h-8 items-center rounded-full border border-border bg-surface pr-1.5 pl-3 text-label font-normal text-gray-700"
                        >
                          <button
                            type="button"
                            onClick={() => search(recent, draftType)}
                          >
                            {recent}
                          </button>
                          <button
                            type="button"
                            aria-label={`${recent} 삭제`}
                            onClick={() => recentSearches.remove(recent)}
                            className="ml-1 flex size-[22px] items-center justify-center text-gray-400"
                          >
                            <X className="size-3" strokeWidth={2.6} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {!keywordError && (
                  <p className="text-caption text-fg-muted">{KEYWORD_ERROR}</p>
                )}
              </div>
            )
          ) : isError ? (
            errorMessage
          ) : isLoading || !data ? (
            <ul className="px-4">
              {Array.from({ length: 6 }, (_, i) => (
                <MobileSkeletonRow key={i} />
              ))}
            </ul>
          ) : posts.length === 0 ? (
            emptyMessage
          ) : (
            <>
              <ul className="px-4">
                {posts.map((post) => (
                  <MobileSearchRow
                    key={post.content_id}
                    post={post}
                    keyword={keyword}
                    type={searchType}
                  />
                ))}
              </ul>
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={goToPage}
                className="py-4"
              />
            </>
          )}
        </div>
      </BoardLayout>
    );
  }

  return (
    <BoardLayout board={boardInfo} onSearch={() => setMobileSearchOpen(true)}>
      <div className="flex flex-1 flex-col bg-surface">
        {isError ? (
          errorMessage
        ) : isLoading || !data ? (
          <ul className="px-4">
            {Array.from({ length: PAGE_SIZE }, (_, i) => (
              <MobileSkeletonRow key={i} />
            ))}
          </ul>
        ) : posts.length === 0 ? (
          emptyMessage
        ) : (
          <>
            <ul className="px-4">
              {posts.map((post) => (
                <MobilePostRow key={post.content_id} post={post} />
              ))}
            </ul>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={goToPage}
              className="py-4"
            />
          </>
        )}
        {/* Keeps the last row clear of the FAB. */}
        {writable && <div className="h-18" aria-hidden />}
      </div>
      {writable && (
        <Fab icon={<PenLine />} onClick={onClickCreate}>
          글쓰기
        </Fab>
      )}
    </BoardLayout>
  );
};

export default ListPost;
