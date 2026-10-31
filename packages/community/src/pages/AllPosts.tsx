import { useNavigate, useRouter, useSearch } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import {
  DesktopAllPostRow,
  DesktopAllPostSkeletonRow,
  MobileAllPostRow,
  MobileAllPostSkeletonRow,
  desktopAllPostColumns,
} from '~/components/Board/AllPostList';
import { BoardFrame } from '~/components/Board/BoardLayout';
import { ListMessage } from '~/components/Board/ListParts';
import { Button, Pagination } from '~/components/ui';
import { ViewportSize, useViewportSize } from '~/contexts/viewportSize';
import { useAllPosts } from '~/hooks/queries/useHomeQueries';
import { cn } from '~/lib/utils';

// The API returns 10 posts a page.
const PAGE_SIZE = 10;

const TITLE = '전체 게시글';
const DESCRIPTION = '내가 볼 수 있는 모든 게시판의 새 글을 모아 봐요.';

function MobileHeader() {
  const router = useRouter();
  return (
    <header className="flex flex-col gap-1 bg-surface-brand pt-[max(0.5rem,env(safe-area-inset-top))] pr-4 pb-4 pl-1 text-fg-on-brand md:hidden">
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="뒤로"
          onClick={() =>
            router.history.canGoBack()
              ? router.history.back()
              : router.navigate({ to: '/' })
          }
          className="flex size-11 shrink-0 items-center justify-center"
        >
          <ChevronLeft className="size-[22px]" />
        </button>
        <h1 className="text-title">{TITLE}</h1>
      </div>
      <p className="pl-4 text-label font-normal leading-normal text-fg-on-brand-muted">
        {DESCRIPTION}
      </p>
    </header>
  );
}

function AllPosts() {
  const navigate = useNavigate({ from: '/posts/all' });
  const { page = 1 } = useSearch({ from: '/posts/all' });
  const isDesktop = useViewportSize() === ViewportSize.Desktop;

  const { data, isLoading, isError, refetch } = useAllPosts(page);
  const posts = data?.postInfo ?? [];
  const totalPages = data ? Math.ceil(data.postCount / PAGE_SIZE) : 0;

  const goToPage = (next: number) => {
    navigate({ search: (prev) => ({ ...prev, page: next }) });
  };

  const errorMessage = (
    <ListMessage
      title="글을 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
      action={
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          다시 시도
        </Button>
      }
    />
  );
  const emptyMessage = <ListMessage title="아직 글이 없어요" />;

  if (isDesktop) {
    return (
      <BoardFrame
        title={TITLE}
        description={DESCRIPTION}
        mobileHeader={<MobileHeader />}
      >
        <div className="flex flex-col rounded-lg bg-surface shadow-sm">
          <div
            className={cn(
              desktopAllPostColumns,
              'border-b border-gray-100 py-3 text-caption font-semibold text-fg-muted',
            )}
            aria-hidden
          >
            <span>게시판</span>
            <span>제목</span>
            <span>작성자</span>
            <span>작성일</span>
            <span className="text-right">댓글</span>
          </div>
          {isError ? (
            errorMessage
          ) : isLoading || !data ? (
            <ul>
              {Array.from({ length: PAGE_SIZE }, (_, i) => (
                <DesktopAllPostSkeletonRow key={i} />
              ))}
            </ul>
          ) : posts.length === 0 ? (
            emptyMessage
          ) : (
            <ul>
              {posts.map((post) => (
                <DesktopAllPostRow key={post.content_id} post={post} />
              ))}
            </ul>
          )}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={goToPage}
            className="border-t border-gray-100 p-4"
          />
        </div>
      </BoardFrame>
    );
  }

  return (
    <BoardFrame
      title={TITLE}
      description={DESCRIPTION}
      mobileHeader={<MobileHeader />}
    >
      <div className="flex flex-1 flex-col bg-surface">
        {isError ? (
          errorMessage
        ) : isLoading || !data ? (
          <ul className="px-4">
            {Array.from({ length: PAGE_SIZE }, (_, i) => (
              <MobileAllPostSkeletonRow key={i} />
            ))}
          </ul>
        ) : posts.length === 0 ? (
          emptyMessage
        ) : (
          <>
            <ul className="px-4">
              {posts.map((post) => (
                <MobileAllPostRow key={post.content_id} post={post} />
              ))}
            </ul>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={goToPage}
              className="py-4"
            />
          </>
        )}
      </div>
    </BoardFrame>
  );
}

export default AllPosts;
