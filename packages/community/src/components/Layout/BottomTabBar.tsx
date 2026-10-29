import type { ReactNode } from 'react';
import { Link, type LinkProps } from '@tanstack/react-router';
import { House, Image, List, Telescope, User } from 'lucide-react';
import { useAuth } from '~/contexts/auth';
import { cn } from '~/lib/utils';
import { EQUIPMENT_GRADE } from './constants';
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

/** Mobile and tablet navigation, fixed to the bottom of the screen. */
export default function BottomTabBar() {
  const { section, destinations } = useNavSection();
  const {
    authInfo: {
      user: { grade },
    },
  } = useAuth();
  const isActive = (target: NavSection) => section === target;

  return (
    <nav
      aria-label="주 메뉴"
      className="fixed inset-x-0 bottom-0 z-30 grid h-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom))] auto-cols-fr grid-flow-col border-t border-border bg-surface px-1 pb-[env(safe-area-inset-bottom)] md:hidden"
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
      {grade <= EQUIPMENT_GRADE && (
        <Tab
          to="/equipment"
          label="장비"
          icon={<Telescope />}
          active={isActive('equipment')}
        />
      )}
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
