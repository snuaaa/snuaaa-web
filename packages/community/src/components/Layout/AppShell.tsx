import type { CSSProperties, ReactNode } from 'react';
import { useLocation } from '@tanstack/react-router';
import { ExternalLink } from 'lucide-react';
import { useBoards } from '~/hooks/queries/useBoardQueries';
import { cn } from '~/lib/utils';
import { Board } from '~/services/types';
import BottomTabBar from './BottomTabBar';
import BrandMark from './BrandMark';
import { CLUB_INTRO_URL, OLD_SITE_URL } from './constants';
import LegacySection from './LegacySection';
import TopNav from './TopNav';

/**
 * Pages already moved to the redesign draw their own mobile header and
 * content width. Every other page keeps the legacy white column
 * (`sass/_section.scss`) until its screen PR moves it.
 */
const REDESIGNED_PATHS = ['/'];
/** Detail pages, edit forms included, that draw their own layout. */
const REDESIGNED_PREFIXES = ['/post/'];
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
    <header className="sticky top-0 z-30 flex h-14 items-center bg-surface-brand px-4 pt-[env(safe-area-inset-top)] md:hidden">
      <BrandMark />
    </header>
  );
}

const footerLinks = [
  { name: '동아리 소개', url: CLUB_INTRO_URL },
  { name: '옛 홈페이지', url: OLD_SITE_URL },
];

/** Shown on every desktop page, and only at the bottom of home on mobile. */
function SiteFooter({ showOnMobile }: { showOnMobile: boolean }) {
  return (
    <div
      role="contentinfo"
      className={cn(
        'border-t border-border bg-surface',
        showOnMobile
          ? 'pb-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom))] md:pb-0'
          : 'hidden md:block',
      )}
    >
      <div className="mx-auto flex max-w-[1080px] flex-col gap-3 px-4 py-6 text-caption text-fg-muted md:flex-row md:items-center md:justify-between md:px-6 md:py-8">
        <ul className="flex gap-4">
          {footerLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-label font-normal text-gray-700 hover:text-fg"
              >
                {link.name}
                <ExternalLink
                  className="size-3.5"
                  aria-label="새 탭에서 열림"
                />
              </a>
            </li>
          ))}
        </ul>
        <p>
          ⓒ 서울대학교 아마추어 천문회 · Amateur Astronomy Association, Since
          1980
        </p>
      </div>
    </div>
  );
}

/** Site chrome: top navigation on desktop, bottom tab bar below it. */
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
        className={cn(
          'flex flex-1 flex-col',
          !isHome &&
            'pb-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom))] md:pb-0',
        )}
      >
        {isRedesigned ? children : <LegacySection>{children}</LegacySection>}
      </main>
      <SiteFooter showOnMobile={isHome} />
      <BottomTabBar />
    </div>
  );
}
