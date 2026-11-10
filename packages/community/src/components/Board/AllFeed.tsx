import type { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { BackButton, Tabs, TabsList, TabsTrigger } from '~/components/ui';
import { cn } from '~/lib/utils';
import { BoardFrame } from './BoardLayout';

export type AllFeedTab = 'posts' | 'comments';

const TABS: { value: AllFeedTab; label: string; to: string }[] = [
  { value: 'posts', label: '게시글', to: '/posts/all' },
  { value: 'comments', label: '댓글', to: '/comments/all' },
];

const TITLE = '전체 게시글';
const DESCRIPTION = '내가 볼 수 있는 모든 게시판의 새 글과 댓글을 모아 봐요.';

/** 게시글 / 댓글 tabs; each tab is its own route. */
export function AllFeedTabs({
  tab,
  className,
}: {
  tab: AllFeedTab;
  className?: string;
}) {
  const navigate = useNavigate();
  return (
    <Tabs
      value={tab}
      onValueChange={(next) =>
        navigate({ to: TABS.find((t) => t.value === next)!.to })
      }
    >
      <TabsList aria-label="보기" className={cn('gap-6 md:gap-7', className)}>
        {TABS.map(({ value, label }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="min-h-12 text-[15px] md:min-h-13"
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

function MobileHeader({ tab }: { tab: AllFeedTab }) {
  return (
    <div className="flex flex-col md:hidden">
      <header className="flex flex-col gap-1 bg-surface-brand pt-safe-2 pr-4 pb-4 pl-1 text-fg-on-brand">
        <div className="flex items-center gap-1">
          <BackButton />
          <h1 className="text-title">{TITLE}</h1>
        </div>
        <p className="pl-4 text-label font-normal leading-normal text-fg-on-brand-muted">
          {DESCRIPTION}
        </p>
      </header>
      <AllFeedTabs tab={tab} className="bg-surface px-4" />
    </div>
  );
}

/** Frame of 전체 게시글: the board sidebar, with 게시글 / 댓글 tabs. */
export function AllFeedLayout({
  tab,
  children,
}: {
  tab: AllFeedTab;
  children: ReactNode;
}) {
  return (
    <BoardFrame
      title={TITLE}
      description={DESCRIPTION}
      mobileHeader={<MobileHeader tab={tab} />}
    >
      {children}
    </BoardFrame>
  );
}
