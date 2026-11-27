import type { ReactNode } from 'react';
import { Link, type LinkProps } from '@tanstack/react-router';
import {
  Archive,
  ChevronRight,
  ExternalLink,
  Globe,
  ScrollText,
  Sparkles,
  Telescope,
  UsersRound,
} from 'lucide-react';
import {
  CLUB_INTRO_URL,
  OLD_SITE_URL,
  canManageUsers,
} from '~/components/Layout/constants';
import { EQUIP_ADMIN_GRADE } from '~/components/Equipment/Rental/rentUtils';
import { BackButton } from '~/components/ui';
import useAuth from '~/hooks/useAuth';

const TITLE = '동아리';

type Entry = {
  title: string;
  description: string;
  icon: ReactNode;
} & ({ to: LinkProps['to']; href?: never } | { href: string; to?: never });

const rowClassName =
  'flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-gray-50 md:px-5';

function EntryRow({ entry }: { entry: Entry }) {
  const body = (
    <>
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-sunken text-navy-700 [&_svg]:size-5"
        aria-hidden
      >
        {entry.icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-body font-semibold">{entry.title}</span>
        <span className="truncate text-label font-normal text-fg-muted">
          {entry.description}
        </span>
      </span>
      {entry.href ? (
        <ExternalLink
          className="size-4 shrink-0 text-fg-muted"
          aria-label="새 탭에서 열림"
        />
      ) : (
        <ChevronRight className="size-4 shrink-0 text-fg-muted" aria-hidden />
      )}
    </>
  );
  return entry.href ? (
    <a
      href={entry.href}
      target="_blank"
      rel="noreferrer"
      className={rowClassName}
    >
      {body}
    </a>
  ) : (
    <Link to={entry.to} className={rowClassName}>
      {body}
    </Link>
  );
}

function Group({
  title,
  badge,
  entries,
}: {
  title: string;
  badge?: string;
  entries: Entry[];
}) {
  return (
    <div role="region" aria-label={title} className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-4 md:px-0">
        <h2 className="text-label text-fg-muted">{title}</h2>
        {badge && (
          <span className="rounded-full bg-info-soft px-2 py-0.5 text-caption font-semibold text-navy-700">
            {badge}
          </span>
        )}
      </div>
      <ul className="flex flex-col divide-y divide-gray-100 bg-surface md:overflow-hidden md:rounded-xl md:border md:border-border">
        {entries.map((entry) => (
          <li key={entry.title}>
            <EntryRow entry={entry} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 동아리: the club's own pages in one place. 회칙 and 역대 임원진 for every
 * member, and the 운영 screens for the grades that may use them.
 */
export default function Club() {
  const { grade } = useAuth().authInfo.user;

  const record: Entry[] = [
    {
      title: '회칙',
      description: '서울대학교 아마추어 천문회 회칙',
      icon: <ScrollText />,
      to: '/club/rules',
    },
    {
      title: '역대 임원진',
      description: '기수별 회장단과 임원진',
      icon: <Sparkles />,
      to: '/officers',
    },
  ];

  const outside: Entry[] = [
    {
      title: '동아리 소개',
      description: 'snuaaa.net',
      icon: <Globe />,
      href: CLUB_INTRO_URL,
    },
    {
      title: '옛 홈페이지',
      description: '예전 사이트의 기록 보관소',
      icon: <Archive />,
      href: OLD_SITE_URL,
    },
  ];

  const manage: Entry[] = [
    ...(canManageUsers(grade)
      ? [
          {
            title: '회원 관리',
            description: '회원 목록과 등급',
            icon: <UsersRound />,
            to: '/admin/user' as const,
          },
        ]
      : []),
    ...(grade <= EQUIP_ADMIN_GRADE
      ? [
          {
            title: '장비 관리',
            description: '장비 목록과 연체료',
            icon: <Telescope />,
            to: '/equipment/admin' as const,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col pb-10 md:mx-auto md:w-full md:max-w-2xl md:gap-6 md:px-6 md:py-6">
      <div className="sticky top-0 z-20 border-b border-gray-100 bg-surface md:hidden">
        <div className="flex h-[52px] items-center justify-between pt-safe-0 pr-3 pl-1">
          <BackButton />
          <h1 className="text-[15px] font-semibold">{TITLE}</h1>
          <div className="min-w-11" />
        </div>
      </div>
      <div className="hidden flex-col gap-1 md:flex">
        <h1 className="text-display">{TITLE}</h1>
        <p className="text-label font-normal text-fg-muted">
          회칙과 역대 임원진, 동아리 운영 메뉴를 모았어요.
        </p>
      </div>
      <div className="flex flex-col gap-6 pt-4 md:pt-0">
        <Group title="동아리 기록" entries={record} />
        {manage.length > 0 && (
          <Group title="운영" badge="토성(6등급) 이상" entries={manage} />
        )}
        <Group title="바깥 링크" entries={outside} />
      </div>
    </div>
  );
}
