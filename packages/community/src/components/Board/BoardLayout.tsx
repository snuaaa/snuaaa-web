import { useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronDown, Search } from 'lucide-react';
import { useAuth } from '~/contexts/auth';
import { useBoards } from '~/hooks/queries/useBoardQueries';
import { cn } from '~/lib/utils';
import { Board } from '~/services/types';
import BoardSwitcher from './BoardSwitcher';
import { BOARD_GROUPS, canRead } from './boardUtils';

const sidebarLinkClassName = (current: boolean) =>
  cn(
    'flex h-[38px] items-center rounded-md px-3 text-sm transition-colors',
    current
      ? 'bg-primary-soft font-semibold text-primary'
      : 'text-gray-700 hover:bg-gray-100 hover:text-fg',
  );

/**
 * Desktop board list on the left of every board page. Without a
 * `currentBoardId`, 전체 게시글 is the current page.
 */
function BoardSidebar({ currentBoardId }: { currentBoardId?: string }) {
  const { boardsInfo } = useBoards();
  const {
    authInfo: {
      user: { grade },
    },
  } = useAuth();

  return (
    <nav
      aria-label="게시판"
      className="sticky top-25 hidden flex-col gap-0.5 md:flex"
    >
      <Link
        to="/posts/all"
        aria-current={currentBoardId ? undefined : 'page'}
        className={sidebarLinkClassName(!currentBoardId)}
      >
        전체 게시글
      </Link>
      {BOARD_GROUPS.map((group) => {
        const boards = boardsInfo.filter(
          (board) => board.menu === group.menu && canRead(board, grade),
        );
        if (boards.length === 0) return null;
        return (
          <div key={group.menu} className="flex flex-col gap-0.5 pt-4">
            <div className="px-3 pb-1.5 text-caption font-semibold text-fg-muted">
              {group.name}
            </div>
            {boards.map((board) => {
              const current = board.board_id === currentBoardId;
              return (
                <Link
                  key={board.board_id}
                  to="/board/$board_id"
                  params={{ board_id: board.board_id }}
                  aria-current={current ? 'page' : undefined}
                  className={sidebarLinkClassName(current)}
                >
                  {board.board_name}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

type BoardMobileHeaderProps = {
  board: Board;
  onSearch?: () => void;
};

/** Navy mobile header: the board name opens the board switcher. */
function BoardMobileHeader({ board, onSearch }: BoardMobileHeaderProps) {
  const [switcherOpen, setSwitcherOpen] = useState(false);

  return (
    <header className="flex flex-col gap-1.5 bg-surface-brand pt-safe-2 pr-2 pb-4 pl-5 text-fg-on-brand md:hidden">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setSwitcherOpen(true)}
          className="flex h-11 min-w-0 items-center gap-1.5 text-title"
          aria-haspopup="dialog"
        >
          <span className="truncate">{board.board_name}</span>
          <ChevronDown
            className="size-[18px] shrink-0 text-accent"
            strokeWidth={2.2}
            aria-label="게시판 바꾸기"
          />
        </button>
        {onSearch && (
          <button
            type="button"
            onClick={onSearch}
            aria-label="검색"
            className="flex size-11 shrink-0 items-center justify-center"
          >
            <Search className="size-[22px]" strokeWidth={1.8} />
          </button>
        )}
      </div>
      {board.board_desc && (
        <p className="text-label font-normal leading-normal text-fg-on-brand-muted">
          {board.board_desc}
        </p>
      )}
      <BoardSwitcher
        currentBoardId={board.board_id}
        open={switcherOpen}
        onOpenChange={setSwitcherOpen}
      />
    </header>
  );
}

type BoardFrameProps = {
  /** The sidebar highlights this board, or 전체 게시글 when left out. */
  currentBoardId?: string;
  title: string;
  description?: string;
  /** Desktop action beside the title, e.g. 글쓰기. Mobile uses a FAB. */
  action?: ReactNode;
  mobileHeader: ReactNode;
  children: ReactNode;
};

/**
 * Board page frame. Mobile: navy header over the list. Desktop: board
 * sidebar on the left, title and list on the right.
 */
export function BoardFrame({
  currentBoardId,
  title,
  description,
  action,
  mobileHeader,
  children,
}: BoardFrameProps) {
  return (
    <div className="flex flex-1 flex-col text-fg">
      {mobileHeader}
      <div className="mx-auto flex w-full max-w-page flex-1 flex-col md:grid md:grid-cols-[220px_minmax(0,1fr)] md:items-start md:gap-8 md:px-6 md:py-9">
        <BoardSidebar currentBoardId={currentBoardId} />
        <div className="flex flex-1 flex-col md:gap-5">
          <div className="hidden items-end justify-between gap-6 md:flex">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-display">{title}</h1>
              {description && (
                <p className="text-sm text-fg-muted">{description}</p>
              )}
            </div>
            {action}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

type BoardLayoutProps = {
  board: Board;
  /** Desktop action beside the title, e.g. 글쓰기. Mobile uses a FAB. */
  action?: ReactNode;
  /** Shows the search button in the mobile header. */
  onSearch?: () => void;
  /** Replaces the mobile header, e.g. while searching. */
  mobileHeader?: ReactNode;
  children: ReactNode;
};

/** {@link BoardFrame} for one board, with the board switcher on mobile. */
export default function BoardLayout({
  board,
  action,
  onSearch,
  mobileHeader,
  children,
}: BoardLayoutProps) {
  return (
    <BoardFrame
      currentBoardId={board.board_id}
      title={board.board_name}
      description={board.board_desc}
      action={action}
      mobileHeader={
        mobileHeader ?? <BoardMobileHeader board={board} onSearch={onSearch} />
      }
    >
      {children}
    </BoardFrame>
  );
}
