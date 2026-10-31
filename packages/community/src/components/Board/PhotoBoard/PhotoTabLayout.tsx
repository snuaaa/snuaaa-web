import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { useAuth } from '~/contexts/auth';
import { useBoards } from '~/hooks/queries/useBoardQueries';
import { cn } from '~/lib/utils';
import { Board } from '~/services/types';
import { canRead } from '../boardUtils';

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
  children: ReactNode;
};

/**
 * Frame of the 사진 tab. Each photo board is a tab: navy header tabs on
 * mobile, underlined tabs under the 사진 title on desktop.
 */
export default function PhotoTabLayout({
  board,
  action,
  toolbar,
  children,
}: PhotoTabLayoutProps) {
  const boards = usePhotoBoards();

  return (
    <div className="flex flex-1 flex-col text-fg">
      <header className="flex flex-col gap-1 bg-surface-brand pt-[max(0.5rem,env(safe-area-inset-top))] pr-2 pl-5 text-fg-on-brand md:hidden">
        <h1 className="flex h-11 items-center text-title">사진</h1>
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
      {toolbar}
      <div className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col md:gap-5 md:px-6 md:pt-8 md:pb-9">
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
          {action && <div className="pb-3">{action}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}
