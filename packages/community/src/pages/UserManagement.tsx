import { useState } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { ArrowDown, ArrowUp, ChevronDown } from 'lucide-react';

import AdminPage from '~/components/Admin/AdminPage';
import GradeSheet from '~/components/Admin/GradeSheet';
import {
  canChangeGrade,
  canManageUsers,
  GRADE_MANAGER_GRADE,
} from '~/components/Layout/constants';
import { Avatar, Pagination, Skeleton, Toast, useToast } from '~/components/ui';
import { useAuth } from '~/contexts/auth';
import { useUserList } from '~/hooks/queries/useUserQueries';
import { cn } from '~/lib/utils';
import { User } from '~/services/types';
import { gradeAssigner } from '~/utils/gradeAssigner';

export type UserSort =
  'id' | 'nickname' | 'aaa_no' | 'grade' | 'created_at' | 'login_at';
export type SortOrder = 'ASC' | 'DESC';

export type UserManagementSearch = {
  page?: number;
  sort?: UserSort;
  order?: SortOrder;
};

const PAGE_SIZE = 20;

const COLUMNS: { key: UserSort; label: string }[] = [
  { key: 'id', label: '아이디' },
  { key: 'nickname', label: '닉네임' },
  { key: 'aaa_no', label: '가입번호' },
  { key: 'grade', label: '등급' },
  { key: 'created_at', label: '가입일' },
  { key: 'login_at', label: '최근 로그인' },
];

const tableColumns = 'grid-cols-[1.2fr_1.3fr_1fr_1fr_1fr_1.2fr]';

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

const WEEKDAYS = '일월화수목금토';
const pad = (n: number) => String(n).padStart(2, '0');

/** 10.28 (화) this year, 2025.03.05 before. */
function formatJoined(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return date.getFullYear() === new Date().getFullYear()
    ? `${pad(date.getMonth() + 1)}.${pad(date.getDate())} (${WEEKDAYS[date.getDay()]})`
    : `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
}

/** 10.30 13:02 this year, 2025.03.01 before. */
function formatLogin(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return date.getFullYear() === new Date().getFullYear()
    ? `${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    : `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
}

/**
 * The grade as a chip. With `onChange` it is a button that opens 등급 조정;
 * it sits above the row's stretched link, so it takes its own clicks.
 */
function GradeChip({
  grade,
  nickname,
  onChange,
}: {
  grade: number;
  nickname?: string;
  onChange?: () => void;
}) {
  const label = [gradeAssigner(grade), grade].filter(Boolean).join(' ');
  const dot = (
    <span
      className={cn('size-2 rounded-full bg-gray-400', GRADE_DOTS[grade])}
      aria-hidden
    />
  );
  if (!onChange) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gray-100 py-0.5 pr-2 pl-1.5 text-micro text-gray-700">
        {dot}
        {label}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onChange}
      aria-label={`${nickname} 등급 조정, 현재 ${label}`}
      className="relative z-10 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-surface py-0.5 pr-1.5 pl-1.5 text-micro text-gray-700 hover:border-gray-300 hover:bg-gray-50"
    >
      {dot}
      {label}
      <ChevronDown className="size-3 text-fg-muted" aria-hidden />
    </button>
  );
}

// Makes the row's link cover the whole row, so a button can sit on top.
const stretchedLink = 'after:absolute after:inset-0 after:content-[""]';

/** 회원 관리: every member, sortable, 20 a page. */
function UserManagement() {
  const { authInfo } = useAuth();
  const myGrade = authInfo.user.grade;
  const allowed = canManageUsers(myGrade);
  const canAdjust = myGrade <= GRADE_MANAGER_GRADE;
  const [adjusting, setAdjusting] = useState<User | null>(null);
  const toast = useToast();
  const gradeChip = (user: User) => (
    <GradeChip
      grade={user.grade}
      nickname={user.nickname}
      onChange={
        canChangeGrade(myGrade, user.grade)
          ? () => setAdjusting(user)
          : undefined
      }
    />
  );
  const search = useSearch({ from: '/admin/user' });
  const navigate = useNavigate({ from: '/admin/user' });
  const page = search.page ?? 1;
  // The API falls back to user_id DESC, which is join order.
  const sort = search.sort ?? 'created_at';
  const order = search.order ?? 'DESC';

  const { data, isLoading, isError } = useUserList(
    {
      sort: search.sort ?? '',
      order: search.order ?? '',
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    },
    allowed,
  );
  const users = data?.userInfo ?? [];
  const count = data?.count ?? 0;

  const setSort = (next: UserSort, nextOrder: SortOrder) =>
    navigate({ search: { sort: next, order: nextOrder } });
  const clickColumn = (key: UserSort) =>
    setSort(key, sort === key && order === 'ASC' ? 'DESC' : 'ASC');

  const userLink = (user: User) => ({
    to: '/userpage/$uuid' as const,
    params: { uuid: user.user_uuid },
  });

  const status = isError
    ? '회원 목록을 불러오지 못했어요.'
    : !isLoading && users.length === 0
      ? '회원이 없어요.'
      : null;

  const pagination = (
    <Pagination
      page={page}
      totalPages={Math.ceil(count / PAGE_SIZE)}
      onPageChange={(next) =>
        navigate({ search: (prev) => ({ ...prev, page: next }) })
      }
    />
  );

  return (
    <AdminPage
      title="회원 관리"
      allowed={allowed}
      subtitle={`전체 ${count}명 · 제목을 누르면 정렬돼요${
        canAdjust ? ' · 등급을 누르면 바꿀 수 있어요' : ''
      }`}
    >
      {/* Mobile */}
      <div className="flex flex-col gap-2 px-4 pt-3 md:hidden">
        <div className="flex items-center justify-between">
          <span className="text-label font-normal text-fg-muted">
            전체 {count}명
          </span>
          <div className="flex gap-1.5">
            <label>
              <span className="sr-only">정렬 기준</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as UserSort, order)}
                className="h-[34px] rounded-full border border-gray-300 bg-surface px-3 text-label font-normal"
              >
                {COLUMNS.map(({ key, label }) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              aria-label={order === 'ASC' ? '오름차순' : '내림차순'}
              onClick={() => setSort(sort, order === 'ASC' ? 'DESC' : 'ASC')}
              className="flex size-[34px] items-center justify-center rounded-full border border-gray-300 bg-surface"
            >
              {order === 'ASC' ? (
                <ArrowUp className="size-4" />
              ) : (
                <ArrowDown className="size-4" />
              )}
            </button>
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="h-96 rounded-xl" />
        ) : status ? (
          <p className="py-16 text-center text-label font-normal text-fg-muted">
            {status}
          </p>
        ) : (
          <ul className="overflow-hidden rounded-xl bg-surface shadow-sm">
            {users.map((user) => (
              <li
                key={user.user_uuid}
                className="relative flex items-center gap-3 border-b border-gray-100 px-3.5 py-3 has-[a:hover]:bg-gray-50"
              >
                <Avatar user={user} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-1.5">
                    <Link
                      {...userLink(user)}
                      className={cn(
                        'truncate text-[15px] font-semibold',
                        stretchedLink,
                      )}
                    >
                      {user.nickname}
                    </Link>
                    {gradeChip(user)}
                  </span>
                  <span className="truncate text-caption text-fg-muted">
                    {user.id} · {user.aaa_no || '가입번호 없음'}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-0.5 text-micro font-normal text-fg-muted tabular-nums">
                  <span>가입 {formatJoined(user.created_at)}</span>
                  <span>접속 {formatLogin(user.login_at)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        {pagination}
      </div>

      {/* Desktop */}
      <div className="hidden flex-col gap-4 md:flex">
        <div
          role="table"
          aria-label="회원 목록"
          className="overflow-hidden rounded-xl border border-border bg-surface"
        >
          <div
            role="row"
            className={cn(
              'grid h-[46px] items-center gap-3 bg-bg px-5',
              tableColumns,
            )}
          >
            {COLUMNS.map(({ key, label }) => {
              const active = sort === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="columnheader"
                  aria-sort={
                    active
                      ? order === 'ASC'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  onClick={() => clickColumn(key)}
                  className={cn(
                    'flex h-9 items-center gap-1 text-left text-caption',
                    active
                      ? 'font-bold text-primary'
                      : 'font-semibold text-fg-muted hover:text-fg',
                  )}
                >
                  {label}
                  {active &&
                    (order === 'ASC' ? (
                      <ArrowUp className="size-3" aria-hidden />
                    ) : (
                      <ArrowDown className="size-3" aria-hidden />
                    ))}
                </button>
              );
            })}
          </div>
          {isLoading ? (
            Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="border-t border-gray-100 px-5 py-2.5">
                <Skeleton className="h-8 rounded-md" />
              </div>
            ))
          ) : status ? (
            <p className="border-t border-gray-100 py-16 text-center text-label font-normal text-fg-muted">
              {status}
            </p>
          ) : (
            users.map((user) => (
              <div
                key={user.user_uuid}
                role="row"
                className={cn(
                  'relative grid h-[52px] items-center gap-3 border-t border-gray-100 px-5 text-sm has-[a:hover]:bg-gray-50',
                  tableColumns,
                )}
              >
                <span
                  role="cell"
                  className="truncate text-label font-normal text-gray-700"
                >
                  {user.id}
                </span>
                <span role="cell" className="flex min-w-0 items-center gap-2">
                  <Avatar user={user} size={28} />
                  <Link
                    {...userLink(user)}
                    className={cn('truncate font-semibold', stretchedLink)}
                  >
                    {user.nickname}
                  </Link>
                </span>
                <span
                  role="cell"
                  className={cn(
                    'text-label font-normal tabular-nums',
                    user.aaa_no ? 'text-gray-700' : 'text-gray-400',
                  )}
                >
                  {user.aaa_no || '—'}
                </span>
                <span role="cell">{gradeChip(user)}</span>
                <span
                  role="cell"
                  className="text-caption text-gray-700 tabular-nums"
                >
                  {formatJoined(user.created_at)}
                </span>
                <span
                  role="cell"
                  className="text-caption text-gray-700 tabular-nums"
                >
                  {formatLogin(user.login_at)}
                </span>
              </div>
            ))
          )}
        </div>
        {pagination}
      </div>
      <GradeSheet
        user={adjusting}
        actorGrade={myGrade}
        onClose={() => setAdjusting(null)}
        onChanged={toast.show}
      />
      <Toast message={toast.message} />
    </AdminPage>
  );
}

export default UserManagement;
