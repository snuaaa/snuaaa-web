import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { skyStyle } from '~/components/Home/skyColors';
import { Avatar } from '~/components/ui';
import { useAuth } from '~/contexts/auth';
import { useBoards } from '~/hooks/queries/useBoardQueries';
import { useMyUserInfo } from '~/hooks/queries/useUserQueries';
import { useSky } from '~/hooks/useSky';
import { cn } from '~/lib/utils';
import { Board } from '~/services/types';
import BrandMark from './BrandMark';
import ObservationToggle from './ObservationToggle';
import { CLUB_INTRO_URL, EQUIPMENT_GRADE, canManageUsers } from './constants';
import { NavSection, useNavSection } from './useNavSection';

const triggerClassName =
  'flex h-10 items-center gap-1 rounded-md px-3.5 text-sm text-navy-300 transition-colors hover:bg-surface-brand-raised hover:text-fg-on-brand data-[active=true]:bg-surface-brand-raised data-[active=true]:font-semibold data-[active=true]:text-fg-on-brand data-[state=open]:bg-surface-brand-raised data-[state=open]:text-fg-on-brand';

const menuClassName =
  'z-50 min-w-48 rounded-lg bg-surface p-1.5 text-fg shadow-md outline-none data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in motion-reduce:animate-none';

const itemClassName =
  'flex h-9 cursor-pointer items-center justify-between gap-3 rounded-md px-3 text-sm text-gray-700 outline-none data-[highlighted]:bg-primary-soft data-[highlighted]:text-fg [&_svg]:size-4 [&_svg]:text-gray-400';

function BoardItems({ label, boards }: { label?: string; boards: Board[] }) {
  if (boards.length === 0) return null;
  return (
    <DropdownMenu.Group>
      {label && (
        <DropdownMenu.Label className="px-3 pt-2 pb-1 text-micro text-fg-muted">
          {label}
        </DropdownMenu.Label>
      )}
      {boards.map((board) => (
        <DropdownMenu.Item
          key={board.board_id}
          asChild
          className={itemClassName}
        >
          <Link to="/board/$board_id" params={{ board_id: board.board_id }}>
            {board.board_name}
          </Link>
        </DropdownMenu.Item>
      ))}
    </DropdownMenu.Group>
  );
}

function NavMenu({
  label,
  active,
  children,
}: {
  label: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger className={triggerClassName} data-active={active}>
        {label}
        <ChevronDown className="size-3.5 opacity-70" aria-hidden />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className={cn(menuClassName, 'max-h-[70vh] overflow-y-auto')}
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function ProfileMenu() {
  const { authInfo, authLogout } = useAuth();
  const { data: { userInfo: myInfo } = {} } = useMyUserInfo();
  const { grade } = authInfo.user;

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        className="rounded-full outline-offset-2"
        aria-label="내 메뉴"
      >
        <Avatar
          size={40}
          user={{
            nickname: myInfo?.nickname ?? authInfo.user.nickname,
            profile_url: myInfo?.profile_url,
            profile_path: myInfo?.profile_path,
          }}
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={menuClassName}
        >
          <DropdownMenu.Item asChild className={itemClassName}>
            <Link to="/mypage/$view" params={{ view: 'info' }}>
              마이페이지
            </Link>
          </DropdownMenu.Item>
          {canManageUsers(grade) && (
            <DropdownMenu.Item asChild className={itemClassName}>
              <Link to="/admin/user">회원 관리</Link>
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item
            className={itemClassName}
            onSelect={() => authLogout?.()}
          >
            로그아웃
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/** Whether the page has scrolled at all; only listens while `enabled`. */
function useScrolled(enabled: boolean) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const update = () => setScrolled(window.scrollY > 0);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [enabled]);
  return enabled && scrolled;
}

/**
 * On home the header is see-through over the home band, so the 하늘 헤더
 * runs behind it. Once the page scrolls it fills in with the sky's top color.
 */
function useHomeHeaderStyle() {
  const isHome =
    useLocation({ select: (location) => location.pathname }) === '/';
  const sky = useSky({ enabled: isHome });
  const scrolled = useScrolled(isHome);
  if (!isHome) return undefined;
  return {
    ...skyStyle(sky),
    background: scrolled ? sky?.top : 'transparent',
  };
}

/** Desktop (768px and up) site header. Boards are picked from dropdowns. */
export default function TopNav() {
  const headerStyle = useHomeHeaderStyle();
  const { section } = useNavSection();
  const { noticeBoards, communityBoards, officialBoards, photoBoards } =
    useBoards();
  const {
    authInfo: {
      user: { grade },
    },
  } = useAuth();

  const readable = (boards: Board[]) =>
    boards.filter((board) => grade <= board.lv_read);
  const isActive = (target: NavSection) => section === target;

  return (
    <header
      className="sticky top-0 z-30 hidden bg-surface-brand text-fg-on-brand transition-colors duration-300 motion-reduce:transition-none md:block"
      style={headerStyle}
    >
      <div className="mx-auto flex h-16 max-w-page items-center gap-8 px-6">
        <BrandMark />
        <nav aria-label="주 메뉴" className="flex flex-1 items-center gap-1">
          <NavMenu label="게시판" active={isActive('board')}>
            <BoardItems label="공지" boards={readable(noticeBoards)} />
            <BoardItems label="일상" boards={readable(communityBoards)} />
            <BoardItems label="기록" boards={readable(officialBoards)} />
          </NavMenu>
          <NavMenu label="사진" active={isActive('photo')}>
            <BoardItems boards={readable(photoBoards)} />
          </NavMenu>
          {grade <= EQUIPMENT_GRADE && (
            <Link
              to="/equipment"
              className={triggerClassName}
              data-active={isActive('equipment')}
            >
              장비 대여
            </Link>
          )}
          <a
            href={CLUB_INTRO_URL}
            target="_blank"
            rel="noreferrer"
            className={triggerClassName}
          >
            동아리 소개
            <ExternalLink
              className="size-3.5 opacity-70"
              aria-label="새 탭에서 열림"
            />
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ObservationToggle />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
