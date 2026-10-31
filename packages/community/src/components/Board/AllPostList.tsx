import { Link } from '@tanstack/react-router';
import { MessageSquare } from 'lucide-react';
import Skeleton from '~/components/Common/Skeleton';
import { Avatar, Tag } from '~/components/ui';
import { useBoards } from '~/hooks/queries/useBoardQueries';
import { cn } from '~/lib/utils';
import { Board, Content } from '~/services/types';
import { NewDot } from './ListParts';
import { formatListDate, isNewPost } from './boardUtils';

/** Boards in the 공지 group get the navy tag, the rest gray. */
export function BoardTag({
  board,
}: {
  board: Pick<Board, 'board_id' | 'board_name'>;
}) {
  const { boardsInfo } = useBoards();
  const menu = boardsInfo.find((b) => b.board_id === board.board_id)?.menu;
  return (
    <Tag variant={menu === 1 ? 'brand' : 'neutral'}>{board.board_name}</Tag>
  );
}

const postLinkProps = (post: Content) =>
  ({
    to: '/post/$post_id',
    params: { post_id: String(post.content_id) },
  }) as const;

export function MobileAllPostRow({ post }: { post: Content }) {
  return (
    <li className="border-b border-gray-100">
      <Link
        {...postLinkProps(post)}
        className="flex flex-col gap-1.5 py-3.5 active:bg-gray-50"
      >
        <span className="flex items-center gap-1.5">
          <BoardTag board={post.board} />
          {isNewPost(post.createdAt) && <NewDot />}
        </span>
        <span className="line-clamp-2 text-body font-medium leading-[1.45]">
          {post.title}
        </span>
        <span className="flex items-center gap-1.5 text-caption text-fg-muted">
          <span className="truncate">{post.user.nickname}</span>
          <span aria-hidden>·</span>
          <span className="shrink-0">{formatListDate(post.createdAt)}</span>
          <span className="flex-1" />
          <span className="flex items-center gap-[3px]">
            <MessageSquare className="size-3.5" aria-label="댓글" />
            {post.comment_num}
          </span>
        </span>
      </Link>
    </li>
  );
}

export const desktopAllPostColumns =
  'grid grid-cols-[100px_minmax(0,1fr)_120px_90px_60px] items-center gap-4 px-5';

export function DesktopAllPostRow({ post }: { post: Content }) {
  return (
    <li className="border-b border-gray-100 last:border-b-0">
      <Link
        {...postLinkProps(post)}
        className={cn(desktopAllPostColumns, 'h-13 text-sm hover:bg-gray-50')}
      >
        <span className="flex min-w-0">
          <BoardTag board={post.board} />
        </span>
        <span className="flex min-w-0 items-center gap-2">
          {isNewPost(post.createdAt) && <NewDot />}
          <span className="truncate font-medium">{post.title}</span>
        </span>
        <span className="flex min-w-0 items-center gap-1.5 text-label font-normal text-gray-700">
          <Avatar user={post.user} size={20} />
          <span className="truncate">{post.user.nickname}</span>
        </span>
        <span className="text-label font-normal text-fg-muted">
          {formatListDate(post.createdAt)}
        </span>
        <span className="text-right text-label font-normal text-fg-muted tabular-nums">
          {post.comment_num}
        </span>
      </Link>
    </li>
  );
}

export function MobileAllPostSkeletonRow() {
  return (
    <li className="flex flex-col gap-2.5 border-b border-gray-100 py-4">
      <Skeleton className="h-4 w-14" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/3" />
    </li>
  );
}

export function DesktopAllPostSkeletonRow() {
  return (
    <li className={cn(desktopAllPostColumns, 'h-13 border-b border-gray-100')}>
      <Skeleton className="h-4 w-14" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-12" />
      <span />
    </li>
  );
}
