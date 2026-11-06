import { Link } from '@tanstack/react-router';
import { CornerUpLeft } from 'lucide-react';
import { commentLink } from '~/components/Comment/commentLink';
import { Avatar, Skeleton } from '~/components/ui';
import { cn } from '~/lib/utils';
import { Comment } from '~/services/types';
import { BoardTag } from './AllPostList';
import { NewDot } from './ListParts';
import { formatListDate, isNewPost } from './boardUtils';

function CommentLink({
  comment,
  className,
  children,
}: {
  comment: Comment;
  className: string;
  children: React.ReactNode;
}) {
  const link = commentLink(comment.content);
  return (
    <Link
      to={link.to}
      params={link.params}
      search={link.search}
      className={className}
    >
      {children}
    </Link>
  );
}

const targetTitle = (comment: Comment) => comment.content.title || '제목 없음';

export function MobileAllCommentRow({ comment }: { comment: Comment }) {
  return (
    <li className="border-b border-gray-100">
      <CommentLink
        comment={comment}
        className="flex flex-col gap-1.5 py-3.5 active:bg-gray-50"
      >
        <span className="flex items-center gap-1.5 text-caption text-fg-muted">
          <Avatar user={comment.user} size={20} />
          <span className="truncate font-medium text-gray-700">
            {comment.user.nickname}
          </span>
          <span aria-hidden>·</span>
          <span className="shrink-0">{formatListDate(comment.createdAt)}</span>
          {isNewPost(comment.createdAt) && <NewDot label="새 댓글" />}
        </span>
        <span className="line-clamp-2 text-body leading-normal break-words">
          {comment.text}
        </span>
        <span className="flex min-w-0 items-center gap-1.5 text-caption text-fg-muted">
          <CornerUpLeft className="size-3.5 shrink-0" aria-hidden />
          <BoardTag board={comment.content.board} />
          <span className="truncate">{targetTitle(comment)}</span>
        </span>
      </CommentLink>
    </li>
  );
}

export const desktopAllCommentColumns =
  'grid grid-cols-[100px_minmax(0,1fr)_120px_90px] items-center gap-4 px-5';

export function DesktopAllCommentRow({ comment }: { comment: Comment }) {
  return (
    <li className="border-b border-gray-100 last:border-b-0">
      <CommentLink
        comment={comment}
        className={cn(
          desktopAllCommentColumns,
          'py-3 text-sm hover:bg-gray-50',
        )}
      >
        <span className="flex min-w-0">
          <BoardTag board={comment.content.board} />
        </span>
        <span className="flex min-w-0 flex-col gap-[3px]">
          <span className="flex min-w-0 items-center gap-2">
            {isNewPost(comment.createdAt) && <NewDot label="새 댓글" />}
            <span className="truncate">{comment.text}</span>
          </span>
          <span className="flex min-w-0 items-center gap-[5px] text-caption text-fg-muted">
            <CornerUpLeft className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{targetTitle(comment)}</span>
          </span>
        </span>
        <span className="flex min-w-0 items-center gap-1.5 text-label font-normal text-gray-700">
          <Avatar user={comment.user} size={20} />
          <span className="truncate">{comment.user.nickname}</span>
        </span>
        <span className="text-label font-normal text-fg-muted">
          {formatListDate(comment.createdAt)}
        </span>
      </CommentLink>
    </li>
  );
}

export function MobileAllCommentSkeletonRow() {
  return (
    <li className="flex flex-col gap-2.5 border-b border-gray-100 py-4">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-1/2" />
    </li>
  );
}

export function DesktopAllCommentSkeletonRow() {
  return (
    <li
      className={cn(desktopAllCommentColumns, 'h-16 border-b border-gray-100')}
    >
      <Skeleton className="h-4 w-14" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-12" />
    </li>
  );
}
