import { useNavigate, useSearch } from '@tanstack/react-router';
import {
  DesktopAllCommentRow,
  DesktopAllCommentSkeletonRow,
  MobileAllCommentRow,
  MobileAllCommentSkeletonRow,
  desktopAllCommentColumns,
} from '~/components/Board/AllCommentList';
import { AllFeedLayout, AllFeedTabs } from '~/components/Board/AllFeed';
import { ListMessage } from '~/components/Board/ListParts';
import { Button, Pagination } from '~/components/ui';
import { ViewportSize, useViewportSize } from '~/contexts/viewportSize';
import { useCommentList } from '~/hooks/queries/useCommentQueries';
import { cn } from '~/lib/utils';

const PAGE_SIZE = 10;

function AllComments() {
  const navigate = useNavigate({ from: '/comments/all' });
  const { page = 1 } = useSearch({ from: '/comments/all' });
  const isDesktop = useViewportSize() === ViewportSize.Desktop;

  const { data, isLoading, isError, refetch } = useCommentList({
    offset: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
  });
  const comments = data?.rows ?? [];
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0;

  const goToPage = (next: number) => {
    navigate({ search: (prev) => ({ ...prev, page: next }) });
  };

  const errorMessage = (
    <ListMessage
      title="댓글을 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
      action={
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          다시 시도
        </Button>
      }
    />
  );
  const emptyMessage = <ListMessage title="아직 댓글이 없어요" />;

  if (isDesktop) {
    return (
      <AllFeedLayout tab="comments">
        <div className="flex flex-col rounded-lg bg-surface shadow-sm">
          <AllFeedTabs tab="comments" className="px-5" />
          <div
            className={cn(
              desktopAllCommentColumns,
              'border-b border-gray-100 py-3 text-caption font-semibold text-fg-muted',
            )}
            aria-hidden
          >
            <span>게시판</span>
            <span>댓글</span>
            <span>작성자</span>
            <span>작성일</span>
          </div>
          {isError ? (
            errorMessage
          ) : isLoading || !data ? (
            <ul>
              {Array.from({ length: PAGE_SIZE }, (_, i) => (
                <DesktopAllCommentSkeletonRow key={i} />
              ))}
            </ul>
          ) : comments.length === 0 ? (
            emptyMessage
          ) : (
            <ul>
              {comments.map((comment) => (
                <DesktopAllCommentRow
                  key={comment.comment_id}
                  comment={comment}
                />
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
    <AllFeedLayout tab="comments">
      <div className="flex flex-1 flex-col bg-surface">
        {isError ? (
          errorMessage
        ) : isLoading || !data ? (
          <ul className="px-4">
            {Array.from({ length: PAGE_SIZE }, (_, i) => (
              <MobileAllCommentSkeletonRow key={i} />
            ))}
          </ul>
        ) : comments.length === 0 ? (
          emptyMessage
        ) : (
          <>
            <ul className="px-4">
              {comments.map((comment) => (
                <MobileAllCommentRow
                  key={comment.comment_id}
                  comment={comment}
                />
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

export default AllComments;
