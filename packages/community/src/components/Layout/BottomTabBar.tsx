import type { ReactNode } from 'react';
import { Link, type LinkProps } from '@tanstack/react-router';
import { House, Image, List, Telescope, User } from 'lucide-react';
import { cn } from '~/lib/utils';
import { NavSection, useNavSection } from './useNavSection';

function Tab({
  label,
  icon,
  active,
  ...linkProps
}: LinkProps & { label: string; icon: ReactNode; active: boolean }) {
  return (
    <Link
      {...linkProps}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex flex-col items-center justify-center gap-1 text-micro transition-colors [&_svg]:size-[22px]',
        active ? 'font-semibold text-primary' : 'text-gray-500',
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

/**
 * Mobile and tablet navigation, fixed to the bottom of the screen. Hidden
 * while the keyboard is up, so it never sits over the field being typed in.
 */
export default function BottomTabBar() {
  const { section, destinations } = useNavSection();
  const isActive = (target: NavSection) => section === target;

  return (
    <nav
      aria-label="주 메뉴"
      className="fixed inset-x-0 bottom-0 z-30 grid [view-transition-name:tab-bar] h-tab-bar auto-cols-fr grid-flow-col border-t border-border bg-surface pr-[max(0.25rem,env(safe-area-inset-right))] pb-safe-0 pl-[max(0.25rem,env(safe-area-inset-left))] keyboard-open:hidden md:hidden"
    >
      <Tab to="/" label="홈" icon={<House />} active={isActive('home')} />
      <Tab
        to="/board/$board_id"
        params={{ board_id: destinations.board }}
        label="게시판"
        icon={<List />}
        active={isActive('board')}
      />
      <Tab
        to="/board/$board_id"
        params={{ board_id: destinations.photo }}
        label="사진"
        icon={<Image />}
        active={isActive('photo')}
      />
      {/* 장비 대여, 회칙, 역대 임원진 and the 운영 screens. */}
      <Tab
        to="/club"
        label="동아리"
        icon={<Telescope />}
        active={isActive('club')}
      />
      <Tab
        to="/mypage/$view"
        params={{ view: 'info' }}
        label="마이"
        icon={<User />}
        active={isActive('my')}
      />
    </nav>
  );
}
