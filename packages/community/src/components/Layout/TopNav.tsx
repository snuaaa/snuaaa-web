import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { Avatar } from '~/components/ui';
import { useAuth } from '~/contexts/auth';
import { useBoards } from '~/hooks/queries/useBoardQueries';
import { useMyUserInfo } from '~/hooks/queries/useUserQueries';
import { cn } from '~/lib/utils';
import { Board } from '~/services/types';
import BrandMark from './BrandMark';
import { ABOUT_AAA_LINKS, EQUIPMENT_GRADE, canManageUsers } from './constants';
import { MenuLink } from './types';
import { NavSection, useNavSection } from './useNavSection';

const triggerClassName =
  'flex h-10 items-center gap-1 rounded-md px-3.5 text-sm text-navy-300 transition-colors hover:bg-surface-brand-raised hover:text-fg-on-brand data-[active=true]:bg-surface-brand-raised data-[active=true]:font-semibold data-[active=true]:text-fg-on-brand data-[state=open]:bg-surface-brand-raised data-[state=open]:text-fg-on-brand';

const menuClassName =
  'z-50 min-w-48 rounded-lg bg-surface p-1.5 text-fg shadow-md outline-none data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in motion-reduce:animate-none';

const itemClassName =
  'flex h-9 cursor-pointer items-center justify-between gap-3 rounded-md px-3 text-sm text-gray-700 outline-none data-[highlighted]:bg-primary-soft data-[highlighted]:text-fg [&_svg]:size-4 [&_svg]:text-gray-400';

function MenuLinkItem({ link }: { link: MenuLink }) {
  return (
    <DropdownMenu.Item asChild className={itemClassName}>
      {link.isExternal ? (
        <a href={link.url} target="_blank" rel="noreferrer">
          {link.name}
          <ExternalLink aria-label="새 탭에서 열림" />
        </a>
      ) : (
        <Link to={link.url}>{link.name}</Link>
      )}
    </DropdownMenu.Item>
  );
}

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

/** Desktop (768px and up) site header. Boards are picked from dropdowns. */
export default function TopNav() {
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
    <header className="sticky top-0 z-30 hidden bg-surface-brand text-fg-on-brand md:block">
      <div className="mx-auto flex h-16 max-w-[1080px] items-center gap-8 px-6">
        <BrandMark />
        <nav aria-label="주 메뉴" className="flex flex-1 items-center gap-1">
          <NavMenu label="소개" active={isActive('about')}>
            {ABOUT_AAA_LINKS.map((link) => (
              <MenuLinkItem key={link.name} link={link} />
            ))}
          </NavMenu>
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
        </nav>
        <ProfileMenu />
      </div>
    </header>
  );
}
