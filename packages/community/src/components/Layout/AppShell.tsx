import type { CSSProperties, ReactNode } from 'react';
import { useLocation } from '@tanstack/react-router';
import BottomTabBar from './BottomTabBar';
import BrandMark from './BrandMark';
import TopNav from './TopNav';

/**
 * Pages already moved to the redesign draw their own mobile header and
 * content width. Every other page keeps the legacy white column
 * (`sass/_section.scss`) until its screen PR moves it.
 */
const REDESIGNED_PATHS = ['/'];

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

function SiteFooter() {
  return (
    <div
      role="contentinfo"
      className="hidden border-t border-border bg-surface md:block"
    >
      <div className="mx-auto max-w-[1080px] px-6 py-8 text-caption text-fg-muted">
        ⓒ 서울대학교 아마추어 천문회 · Amateur Astronomy Association, Since 1980
      </div>
    </div>
  );
}

/** Site chrome: top navigation on desktop, bottom tab bar below it. */
export default function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isRedesigned = REDESIGNED_PATHS.includes(pathname);

  return (
    <div
      className="flex min-h-full flex-col bg-bg [--fab-bottom:calc(var(--tab-bar-height)+env(safe-area-inset-bottom)+1rem)] md:[--fab-bottom:1.5rem]"
      style={shellStyle}
    >
      <TopNav />
      {!isRedesigned && <MobileHeader />}
      <main className="flex flex-1 flex-col pb-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom))] md:pb-0">
        {isRedesigned ? (
          children
        ) : (
          <div className="section-wrapper">
            <section>{children}</section>
          </div>
        )}
      </main>
      <SiteFooter />
      <BottomTabBar />
    </div>
  );
}
