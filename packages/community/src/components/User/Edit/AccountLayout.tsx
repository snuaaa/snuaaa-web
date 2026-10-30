import { useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';

import { ConfirmDialog } from '~/components/ui';
import { useAuth } from '~/contexts/auth';
import { useDeleteUserInfo } from '~/hooks/queries/useUserQueries';
import { cn } from '~/lib/utils';

export type AccountView = 'profile' | 'password';

const NAV: { view: AccountView; label: string }[] = [
  { view: 'profile', label: '프로필 수정' },
  { view: 'password', label: '비밀번호 변경' },
];

type AccountLayoutProps = {
  view: AccountView;
  /** e.g. 저장, in the mobile header and next to the desktop title. */
  action?: ReactNode;
  children: ReactNode;
};

/**
 * 프로필 수정 and 비밀번호 변경. Mobile gets a header with a back button;
 * desktop gets a side menu with 회원 탈퇴 under it.
 */
export default function AccountLayout({
  view,
  action,
  children,
}: AccountLayoutProps) {
  const { authLogout } = useAuth();
  const { mutateAsync: deleteUser, isPending: deleting } = useDeleteUserInfo();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawError, setWithdrawError] = useState(false);

  const title = NAV.find((item) => item.view === view)?.label;
  const back =
    view === 'password'
      ? ({ to: '/mypage/$view', params: { view: 'profile' } } as const)
      : ({ to: '/mypage/$view', params: { view: 'info' } } as const);

  const withdraw = async () => {
    setWithdrawError(false);
    try {
      await deleteUser();
      setWithdrawOpen(false);
      authLogout();
    } catch (err) {
      console.error(err);
      setWithdrawError(true);
    }
  };

  const withdrawButton = (className: string) => (
    <button
      type="button"
      onClick={() => {
        setWithdrawError(false);
        setWithdrawOpen(true);
      }}
      className={className}
    >
      회원 탈퇴
    </button>
  );

  return (
    <div className="flex flex-1 flex-col md:mx-auto md:grid md:w-full md:max-w-[1080px] md:grid-cols-[220px_minmax(0,1fr)] md:items-start md:gap-8 md:px-6 md:py-9">
      <header className="sticky top-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center border-b border-gray-100 bg-surface pt-[max(0.5rem,env(safe-area-inset-top))] pr-3 pb-2 pl-1 md:hidden">
        <Link
          {...back}
          aria-label="뒤로"
          className="flex size-11 items-center justify-center"
        >
          <ChevronLeft className="size-[22px]" />
        </Link>
        <h1 className="text-[15px] font-semibold">{title}</h1>
        <div className="flex justify-end">{action}</div>
      </header>

      <nav aria-label="계정" className="hidden flex-col gap-0.5 md:flex">
        <Link
          to="/mypage/$view"
          params={{ view: 'info' }}
          className="flex h-[38px] items-center gap-0.5 px-3 text-label font-normal text-fg-muted hover:text-fg"
        >
          <ChevronLeft className="size-4" aria-hidden />
          마이페이지
        </Link>
        {NAV.map((item) => (
          <Link
            key={item.view}
            to="/mypage/$view"
            params={{ view: item.view }}
            aria-current={item.view === view ? 'page' : undefined}
            className={cn(
              'flex h-10 items-center rounded-md px-3 text-sm hover:bg-gray-100',
              item.view === view && 'bg-gray-100 font-semibold',
            )}
          >
            {item.label}
          </Link>
        ))}
        <div className="mx-3 my-2.5 h-px bg-border" />
        {withdrawButton(
          'flex h-10 items-center rounded-md px-3 text-label font-normal text-danger hover:bg-danger-soft',
        )}
      </nav>

      <div className="flex flex-1 flex-col md:rounded-xl md:border md:border-border md:bg-surface md:px-8 md:py-7">
        <div className="mb-6 hidden items-center justify-between md:flex">
          <h1 className="text-[22px] font-bold">{title}</h1>
          {action}
        </div>
        {children}
        {view === 'profile' && (
          <div className="flex justify-center p-4 md:hidden">
            {withdrawButton(
              'h-11 px-3 text-label font-normal text-danger underline',
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        title="정말 탈퇴할까요?"
        description={
          withdrawError
            ? '탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요.'
            : '탈퇴는 되돌릴 수 없어요.'
        }
        confirmLabel="탈퇴"
        tone="danger"
        loading={deleting}
        onConfirm={withdraw}
      />
    </div>
  );
}
