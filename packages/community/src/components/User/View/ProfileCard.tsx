import { Link } from '@tanstack/react-router';
import { Settings } from 'lucide-react';

import { Avatar, BackButton, Button } from '~/components/ui';
import { cn } from '~/lib/utils';
import { User } from '~/services/types';
import { gradeAssigner } from '~/utils/gradeAssigner';

// Full class names so Tailwind can find them.
const GRADE_DOTS: Record<number, string> = {
  1: 'bg-grade-1',
  3: 'bg-grade-3',
  4: 'bg-grade-4',
  5: 'bg-grade-5',
  6: 'bg-grade-6',
  7: 'bg-grade-7',
  8: 'bg-grade-8',
  9: 'bg-grade-9',
};

type ProfileCardProps = {
  user: User;
  isMine: boolean;
};

/**
 * The navy profile band on mobile, the left card on desktop. Other members
 * don't see the email (docs/redesign.md, 이메일 비공개). 동아리 번호 and
 * 자기소개 get their own labeled rows so they read as profile facts.
 */
export default function ProfileCard({ user, isMine }: ProfileCardProps) {
  const gradeName = gradeAssigner(user.grade);
  const rows = [
    user.aaa_no && { label: '동아리 번호', value: user.aaa_no },
    isMine && user.email && { label: '이메일', value: user.email },
    user.col_no && { label: '학번', value: `${user.col_no}학번` },
    user.major && { label: '전공', value: user.major },
  ].filter((row): row is { label: string; value: string } => Boolean(row));

  return (
    <div className="flex flex-col md:overflow-hidden md:rounded-xl md:bg-surface md:shadow-sm">
      <div className="flex flex-col gap-3.5 bg-surface-brand pb-[22px] text-fg-on-brand md:items-center md:gap-2.5 md:px-6 md:pt-7 md:text-center">
        <div className="flex min-h-11 items-center justify-between px-1 pt-safe-2 md:hidden">
          {isMine ? (
            <>
              <h1 className="pl-3 text-lg font-bold">마이</h1>
              <Link
                to="/mypage/$view"
                params={{ view: 'profile' }}
                aria-label="프로필 수정"
                className="flex size-11 items-center justify-center"
              >
                <Settings className="size-[22px]" strokeWidth={1.8} />
              </Link>
            </>
          ) : (
            <BackButton />
          )}
        </div>

        <div className="flex items-center gap-4 px-4 md:flex-col md:gap-2.5 md:px-0">
          <Avatar
            user={user}
            size={80}
            showGrade
            className="md:size-26 [&>span]:border-[3px] [&>span]:border-surface-brand"
          />
          <div className="flex min-w-0 flex-col gap-1.5 md:items-center">
            <div className="truncate text-[22px] font-bold tracking-[-0.4px]">
              {user.nickname}
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-center">
              {gradeName && (
                <span className="flex h-6 items-center gap-1.5 rounded-full bg-surface-brand-raised pr-2.5 pl-2 text-caption font-semibold">
                  <span
                    className={cn(
                      'size-2.5 rounded-full',
                      GRADE_DOTS[user.grade],
                    )}
                    aria-hidden
                  />
                  {gradeName}
                </span>
              )}
            </div>
          </div>
        </div>

        {isMine && (
          <div className="px-4 md:hidden">
            <Link
              to="/mypage/$view"
              params={{ view: 'profile' }}
              className="flex h-10 items-center justify-center rounded-md border border-navy-500 text-sm font-semibold"
            >
              프로필 수정
            </Link>
          </div>
        )}
      </div>

      <div className="mb-2 flex flex-col bg-surface px-4 py-1 md:mb-0 md:px-6 md:pt-2 md:pb-4">
        <dl>
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex gap-3 border-b border-gray-100 py-2.5 text-sm md:py-3"
            >
              <dt className="w-20 shrink-0 text-fg-muted">{row.label}</dt>
              <dd className="min-w-0 truncate">{row.value}</dd>
            </div>
          ))}
          <div className="flex flex-col gap-1.5 py-3 text-sm md:pt-3.5">
            <dt className="text-fg-muted">자기소개</dt>
            <dd
              className={cn(
                'leading-relaxed break-words whitespace-pre-line',
                !user.introduction?.trim() && 'text-fg-muted',
              )}
            >
              {user.introduction?.trim() || '아직 자기소개가 없어요'}
            </dd>
          </div>
        </dl>
        {isMine && (
          <div className="hidden flex-col gap-2 pt-4 md:flex">
            <Button asChild>
              <Link to="/mypage/$view" params={{ view: 'profile' }}>
                프로필 수정
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/mypage/$view" params={{ view: 'password' }}>
                비밀번호 변경
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
