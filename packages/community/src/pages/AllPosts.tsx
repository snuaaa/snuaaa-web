import { useNavigate, useSearch } from '@tanstack/react-router';
import {
  DesktopAllPostRow,
  DesktopAllPostSkeletonRow,
  MobileAllPostRow,
  MobileAllPostSkeletonRow,
  desktopAllPostColumns,
} from '~/components/Board/AllPostList';
import { AllFeedLayout, AllFeedTabs } from '~/components/Board/AllFeed';
import { ListMessage } from '~/components/Board/ListParts';
import { Button, Pagination } from '~/components/ui';
import { ViewportSize, useViewportSize } from '~/contexts/viewportSize';
import { useAllPosts } from '~/hooks/queries/useHomeQueries';
import { cn } from '~/lib/utils';

// The API returns 10 posts a page.
const PAGE_SIZE = 10;

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
      <AllFeedLayout tab="posts">
        <div className="flex flex-col rounded-lg bg-surface shadow-sm">
          <AllFeedTabs tab="posts" className="px-5" />
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
      </AllFeedLayout>
    );
  }

  return (
    <AllFeedLayout tab="posts">
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
    </AllFeedLayout>
  );
}

export default AllPosts;
