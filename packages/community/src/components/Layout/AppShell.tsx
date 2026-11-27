import type { CSSProperties, ReactNode } from 'react';
import { useLocation } from '@tanstack/react-router';
import { useBoards } from '~/hooks/queries/useBoardQueries';
import { cn } from '~/lib/utils';
import { Board } from '~/services/types';
import BottomTabBar from './BottomTabBar';
import BrandMark from './BrandMark';
import LegacySection from './LegacySection';
import TopNav from './TopNav';

/**
 * Pages already moved to the redesign draw their own mobile header and
 * content width. Every other page keeps the legacy white column
 * (`sass/_section.scss`) until its screen PR moves it.
 */
const REDESIGNED_PATHS = [
  '/',
  '/equipment',
  '/equipment/rent',
  '/equipment/admin',
  '/equipment/admin/fees',
  '/admin/user',
  '/posts/all',
  '/comments/all',
  '/officers',
  '/club',
  '/club/rules',
];
/** Detail pages, edit forms included, that draw their own layout. */
const REDESIGNED_PREFIXES = [
  '/post/',
  '/document/',
  '/album/',
  '/exhibition/',
  '/mypage/',
  '/userpage/',
];
/** Board types whose list screen has moved to the redesign. */
const REDESIGNED_BOARD_TYPES: Board['board_type'][] = ['N', 'D', 'A', 'M', 'E'];

function useIsRedesigned() {
  const { pathname } = useLocation();
  const { boardsInfo } = useBoards();
  if (REDESIGNED_PATHS.includes(pathname)) return true;
  if (REDESIGNED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }
  const boardId = pathname.match(/^\/board\/([^/]+)\/?$/)?.[1];
  if (!boardId) return false;
  const board = boardsInfo.find((b) => b.board_id === boardId);
  // Until the board list loads the page only shows a spinner, so skip the
  // legacy column rather than flash it before a redesigned board.
  if (!board) return true;
  return REDESIGNED_BOARD_TYPES.includes(board.board_type);
}

const shellStyle = {
  '--tab-bar-height': '3.5rem',
} as CSSProperties;

function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center bg-surface-brand px-4 pt-safe-0 md:hidden">
      <BrandMark />
    </header>
  );
}

/** Shown on every desktop page, and only at the bottom of home on mobile.
 *  Only the copyright: 동아리 and the outside sites are in the 동아리 tab. */
function SiteFooter({ showOnMobile }: { showOnMobile: boolean }) {
  return (
    <div
      role="contentinfo"
      className={cn(
        'border-t border-border bg-surface',
        showOnMobile ? 'pb-tab-bar md:pb-0' : 'hidden md:block',
      )}
    >
      <div className="mx-auto max-w-page px-4 py-6 text-caption text-fg-muted md:px-6 md:py-8">
        <p>
          ⓒ 서울대학교 아마추어 천문회 · Amateur Astronomy Association, Since
          1980
        </p>
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isRedesigned = useIsRedesigned();
  // On mobile the footer only shows on home, and then it clears the tab bar.
  const isHome = pathname === '/';

  return (
    <div
      className="flex min-h-dvh flex-col bg-bg [--fab-bottom:calc(var(--tab-bar-height)+env(safe-area-inset-bottom)+1rem)] md:[--fab-bottom:1.5rem]"
      style={shellStyle}
    >
      <TopNav />
      {!isRedesigned && <MobileHeader />}
      <main
        className={cn('flex flex-1 flex-col', !isHome && 'pb-tab-bar md:pb-0')}
      >
        {isRedesigned ? children : <LegacySection>{children}</LegacySection>}
      </main>
      <SiteFooter showOnMobile={isHome} />
      <BottomTabBar />
    </div>
  );
}
