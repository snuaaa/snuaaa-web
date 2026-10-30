import type { ReactNode } from 'react';
import { Link, useRouter, type LinkProps } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';

import { cn } from '~/lib/utils';

type AdminPageProps = {
  title: string;
  /** Whether the member's grade may open this page. */
  allowed: boolean;
  /** Above the desktop title, e.g. ‹ 장비 대여. */
  breadcrumb?: ReactNode;
  /** Right side of the mobile header, e.g. 분류. */
  mobileAction?: ReactNode;
  /** Under the desktop title, e.g. 전체 120명. */
  subtitle?: ReactNode;
  /** Tabs under the header. */
  tabs?: ReactNode;
  children: ReactNode;
};

/**
 * The frame of the 토성(6등급) 이상 screens: a white header with a back
 * arrow on mobile, a title with the grade chip on desktop.
 */
export default function AdminPage({
  title,
  allowed,
  breadcrumb,
  mobileAction,
  subtitle,
  tabs,
  children,
}: AdminPageProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col pb-10 md:mx-auto md:w-full md:max-w-[1080px] md:gap-4 md:px-6 md:py-6">
      <div className="sticky top-0 z-20 bg-surface md:hidden">
        <div className="flex h-[52px] items-center justify-between pt-[env(safe-area-inset-top)] pr-3 pl-1">
          <button
            type="button"
            aria-label="뒤로"
            onClick={() =>
              router.history.canGoBack()
                ? router.history.back()
                : router.navigate({ to: '/' })
            }
            className="flex size-11 items-center justify-center"
          >
            <ChevronLeft className="size-[22px]" />
          </button>
          <h1 className="text-[15px] font-semibold">{title}</h1>
          <div className="flex min-w-11 justify-end">
            {allowed && mobileAction}
          </div>
        </div>
        {allowed && tabs}
        {!tabs && <div className="border-b border-gray-100" />}
      </div>
      <div className="hidden flex-col gap-1 md:flex">
        {breadcrumb}
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-display">{title}</h1>
            {allowed && subtitle && (
              <p className="text-label font-normal text-fg-muted">{subtitle}</p>
            )}
          </div>
          <span className="rounded-full bg-info-soft px-2.5 py-1 text-caption font-semibold text-navy-700">
            토성(6등급) 이상
          </span>
        </div>
      </div>
      {allowed ? (
        <>
          {tabs && <div className="hidden md:block">{tabs}</div>}
          {children}
        </>
      ) : (
        <p className="py-20 text-center text-label font-normal text-fg-muted">
          토성(6등급) 이상만 볼 수 있어요.
        </p>
      )}
    </div>
  );
}

type AdminTabProps = {
  to: LinkProps['to'];
  active: boolean;
  children: ReactNode;
};

/**
 * A route-backed tab: 장비 and 연체료 are separate pages. Switching replaces
 * the history entry, so 뒤로 leaves 장비 관리.
 */
export function AdminTab({ to, active, children }: AdminTabProps) {
  return (
    <Link
      to={to}
      replace
      role="tab"
      aria-selected={active}
      className={cn(
        '-mb-px flex h-[46px] flex-1 items-center justify-center gap-1.5 border-b-2 text-sm md:h-11 md:flex-none md:px-4 md:text-[15px]',
        active
          ? 'border-primary font-bold text-fg'
          : 'border-transparent font-medium text-fg-muted hover:text-fg',
      )}
    >
      {children}
    </Link>
  );
}

export function AdminTabs({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex border-b border-gray-100 md:gap-1 md:border-border"
    >
      {children}
    </div>
  );
}
