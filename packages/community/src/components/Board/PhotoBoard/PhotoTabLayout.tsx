import { type ReactNode, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { Button } from '~/components/ui';
import { useAuth } from '~/contexts/auth';
import { ViewportSize, useViewportSize } from '~/contexts/viewportSize';
import { useBoards } from '~/hooks/queries/useBoardQueries';
import { cn } from '~/lib/utils';
import { Board } from '~/services/types';
import { canRead } from '../boardUtils';
import {
  DesktopSearchControls,
  MobileSearchHeader,
  RecentSearches,
} from '../BoardSearch';
import {
  BoardSearchState,
  KEYWORD_ERROR,
  searchTypeLabel,
} from '../useBoardSearch';

/** Boards under the 사진 tab (별사진, 추억 만들기, 사진전). */
export const PHOTO_MENU = 4;

function usePhotoBoards() {
  const { boardsInfo } = useBoards();
  const {
    authInfo: {
      user: { grade },
    },
  } = useAuth();
  return boardsInfo
    .filter((board) => board.menu === PHOTO_MENU && canRead(board, grade))
    .sort((a, b) => a.order - b.order);
}

type PhotoTabLayoutProps = {
  board: Board;
  /** Desktop action at the right of the tabs, e.g. 사진 올리기. */
  action?: ReactNode;
  /** Mobile row under the navy header, e.g. the tag filter bar. */
  toolbar?: ReactNode;
  /** Turns on search: a field on desktop, a header button on mobile. */
  search?: BoardSearchState;
  /** Number of search results, for the result line. */
  resultCount?: number;
  children: ReactNode;
};

/** Desktop line over the results: the keyword error or the result count. */
function DesktopSearchSummary({
  search,
  resultCount,
}: {
  search: BoardSearchState;
  resultCount?: number;
}) {
  if (search.keywordError) {
    return (
      <p className="hidden text-label font-normal text-danger md:block">
        {KEYWORD_ERROR}
      </p>
    );
  }
  if (!search.isSearching) return null;
  return (
    <div className="hidden min-w-0 items-center gap-2 text-label font-normal text-fg-muted md:flex">
      <span className="truncate">
        ‘{search.keyword}’ {searchTypeLabel(search.searchType)} 검색 결과{' '}
        <b className="font-semibold text-fg">{resultCount ?? 0}</b>개
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2"
        onClick={search.clearSearch}
      >
        검색 해제
      </Button>
    </div>
  );
}

/**
 * Frame of the 사진 tab. Each photo board is a tab: navy header tabs on
 * mobile, underlined tabs under the 사진 title on desktop.
 */
export default function PhotoTabLayout({
  board,
  action,
  toolbar,
  search,
  resultCount,
  children,
}: PhotoTabLayoutProps) {
  const boards = usePhotoBoards();
  const isDesktop = useViewportSize() === ViewportSize.Desktop;
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const showMobileSearch =
    !!search && !isDesktop && (mobileSearchOpen || search.isSearching);

  // Before the first search, the mobile page shows only recent keywords.
  const showRecentSearches = showMobileSearch && !search.isSearching;

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    if (search?.isSearching) search.clearSearch();
  };

  const mobileHeader = showMobileSearch ? (
    <MobileSearchHeader
      search={search}
      onClose={closeMobileSearch}
      summary={
        <p className="text-label font-normal text-fg-muted">
          {board.board_name}에서{' '}
          <b className="font-semibold text-fg">
            {searchTypeLabel(search.searchType)}
          </b>{' '}
          검색 결과{' '}
          <b className="font-semibold text-fg">{resultCount ?? 0}건</b>
        </p>
      }
    />
  ) : (
    <header className="flex flex-col gap-1 bg-surface-brand pt-safe-2 pr-2 pl-5 text-fg-on-brand md:hidden">
      <div className="flex items-center justify-between">
        <h1 className="flex h-11 items-center text-title">사진</h1>
        {search && (
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            aria-label="검색"
            className="flex size-11 shrink-0 items-center justify-center"
          >
            <Search className="size-[22px]" strokeWidth={1.8} />
          </button>
        )}
      </div>
      <nav aria-label="사진 게시판" className="flex gap-[22px]">
        {boards.map((b) => {
          const current = b.board_id === board.board_id;
          return (
            <Link
              key={b.board_id}
              to="/board/$board_id"
              params={{ board_id: b.board_id }}
              aria-current={current ? 'page' : undefined}
              className={cn(
                'border-b-3 pt-2.5 pb-3 text-body',
                current
                  ? 'border-accent font-bold text-fg-on-brand'
                  : 'border-transparent font-medium text-fg-on-brand-muted hover:text-fg-on-brand',
              )}
            >
              {b.board_name}
            </Link>
          );
        })}
      </nav>
    </header>
  );

  return (
    <div className="flex flex-1 flex-col text-fg">
      {mobileHeader}
      {!showRecentSearches && toolbar}
      <div className="mx-auto flex w-full max-w-page flex-1 flex-col md:gap-5 md:px-6 md:pt-8 md:pb-9">
        <div className="hidden items-end justify-between gap-6 border-b border-border md:flex">
          <div className="flex flex-col gap-3.5">
            <h1 className="text-display">사진</h1>
            <nav aria-label="사진 게시판" className="flex gap-7">
              {boards.map((b) => {
                const current = b.board_id === board.board_id;
                return (
                  <Link
                    key={b.board_id}
                    to="/board/$board_id"
                    params={{ board_id: b.board_id }}
                    aria-current={current ? 'page' : undefined}
                    className={cn(
                      '-mb-px border-b-3 pb-3 text-base',
                      current
                        ? 'border-primary font-bold text-primary'
                        : 'border-transparent font-medium text-fg-muted hover:text-fg',
                    )}
                  >
                    {b.board_name}
                  </Link>
                );
              })}
            </nav>
          </div>
          {(search || action) && (
            <div className="flex items-center gap-2 pb-3">
              {search && isDesktop && (
                <DesktopSearchControls
                  search={search}
                  fieldClassName="w-[220px]"
                />
              )}
              {action}
            </div>
          )}
        </div>
        {search && isDesktop && (
          <DesktopSearchSummary search={search} resultCount={resultCount} />
        )}
        {showRecentSearches ? (
          <div className="flex flex-1 flex-col bg-surface">
            <RecentSearches search={search} />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
