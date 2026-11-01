import { type ReactNode } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  CornerUpLeft,
  Image as ImageIcon,
  MessageSquare,
  NotebookPen,
} from 'lucide-react';

import { formatListDate } from '~/components/Board/boardUtils';
import { commentLink } from '~/components/Comment/commentLink';
import {
  Pagination,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
} from '~/components/ui';
import { useCommentList } from '~/hooks/queries/useCommentQueries';
import { usePhotoList } from '~/hooks/queries/usePhotoQueries';
import { usePostList } from '~/hooks/queries/usePostQueries';
import { resolveImageUrl } from '~/lib/utils';

export type ActivityTab = 'posts' | 'photos' | 'comments';

const TABS: { value: ActivityTab; label: string }[] = [
  { value: 'posts', label: '게시글' },
  { value: 'photos', label: '사진' },
  { value: 'comments', label: '댓글' },
];

const PAGE_SIZE = { posts: 10, photos: 12, comments: 10 };

type ListProps = {
  userUuid: string;
  /** The owner's nickname, or undefined on 마이페이지. */
  otherNickname?: string;
  page: number;
  onPageChange: (page: number) => void;
};

function Empty({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2.5 px-4 pt-24 pb-28 text-center md:pt-28">
      <span className="flex size-14 items-center justify-center rounded-full bg-bg text-gray-400 [&_svg]:size-6">
        {icon}
      </span>
      <p className="text-body font-semibold">{title}</p>
      {body && <p className="text-label font-normal text-fg-muted">{body}</p>}
    </div>
  );
}

function LoadError() {
  return (
    <p className="px-4 py-24 text-center text-label font-normal text-fg-muted">
      목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
    </p>
  );
}

function RowSkeletons() {
  return (
    <ul aria-hidden className="px-4 md:px-7">
      {Array.from({ length: 5 }, (_, i) => (
        <li
          key={i}
          className="flex flex-col gap-2 border-b border-gray-100 py-4"
        >
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-1/4" />
        </li>
      ))}
    </ul>
  );
}

function ListPagination({
  page,
  count,
  pageSize,
  onPageChange,
}: {
  page: number;
  count: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <Pagination
      page={page}
      totalPages={Math.ceil(count / pageSize)}
      onPageChange={onPageChange}
      className="mt-auto p-4"
    />
  );
}

function PostList({ userUuid, otherNickname, page, onPageChange }: ListProps) {
  const { data, isLoading, isError } = usePostList({
    user_uuid: userUuid,
    offset: (page - 1) * PAGE_SIZE.posts,
    limit: PAGE_SIZE.posts,
  });

  if (isLoading) return <RowSkeletons />;
  if (isError || !data) return <LoadError />;
  if (data.count === 0) {
    return (
      <Empty
        icon={<NotebookPen />}
        title="아직 쓴 글이 없어요"
        body={
          otherNickname
            ? `${otherNickname}님이 글을 쓰면 여기에 보여요.`
            : '첫 글을 남겨 보세요.'
        }
      />
    );
  }

  return (
    <>
      <ul className="px-4 md:px-7">
        {data.rows.map((post) => (
          <li key={post.content_id}>
            <Link
              to="/post/$post_id"
              params={{ post_id: String(post.content_id) }}
              className="flex flex-col gap-1.5 border-b border-gray-100 py-3.5 md:grid md:h-14 md:grid-cols-[100px_minmax(0,1fr)_80px_110px] md:items-center md:gap-4 md:py-0"
            >
              <div className="flex min-w-0 items-center gap-1.5 md:contents">
                <span className="shrink-0 rounded-[6px] bg-gray-100 px-[7px] py-[3px] text-micro text-gray-700 md:truncate md:bg-transparent md:p-0 md:text-caption md:font-normal">
                  {post.board.board_name}
                </span>
                <span className="truncate text-body font-medium md:text-sm">
                  {post.title}
                </span>
              </div>
              <div className="text-caption text-fg-muted md:contents">
                <span className="md:text-label md:font-normal">
                  {formatListDate(post.createdAt)}
                </span>
                <span className="md:hidden"> · </span>
                <span className="md:text-right md:text-label md:font-normal">
                  추천 {post.like_num} · 댓글 {post.comment_num}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <ListPagination
        page={page}
        count={data.count}
        pageSize={PAGE_SIZE.posts}
        onPageChange={onPageChange}
      />
    </>
  );
}

function PhotoList({ userUuid, otherNickname, page, onPageChange }: ListProps) {
  const { data, isLoading, isError } = usePhotoList({
    user_uuid: userUuid,
    offset: (page - 1) * PAGE_SIZE.photos,
    limit: PAGE_SIZE.photos,
  });

  if (isLoading) {
    return (
      <div
        aria-hidden
        className="grid grid-cols-3 gap-0.5 pt-3 md:grid-cols-4 md:gap-2 md:px-7 md:py-5"
      >
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton
            key={i}
            className="aspect-square rounded-none md:rounded-[10px]"
          />
        ))}
      </div>
    );
  }
  if (isError || !data) return <LoadError />;
  if (data.count === 0) {
    return (
      <Empty
        icon={<ImageIcon />}
        title="아직 올린 사진이 없어요"
        body={
          otherNickname
            ? `${otherNickname}님이 사진을 올리면 여기에 보여요.`
            : undefined
        }
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 pt-3 md:px-7 md:pt-5">
        <p className="px-4 text-caption text-fg-muted md:px-0">
          사진을 열면 {otherNickname ? `${otherNickname}님이` : '내가'} 올린
          사진 안에서 넘겨 볼 수 있어요
        </p>
        <ul className="grid grid-cols-3 gap-0.5 md:grid-cols-4 md:gap-2">
          {data.rows.map((photo) => (
            <li key={photo.content_id}>
              <Link
                to="."
                search={(prev) => ({
                  ...prev,
                  photo: photo.content_id,
                  photoNavigation: 'user' as const,
                })}
                className="group block aspect-square overflow-hidden bg-navy-800 md:rounded-[10px]"
              >
                <img
                  src={resolveImageUrl(
                    photo.photo?.thumbnail_url ?? photo.photo?.thumbnail_path,
                  )}
                  alt={photo.title || '사진'}
                  loading="lazy"
                  className="size-full object-cover transition-transform md:group-hover:scale-[1.03]"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <ListPagination
        page={page}
        count={data.count}
        pageSize={PAGE_SIZE.photos}
        onPageChange={onPageChange}
      />
    </>
  );
}

function CommentList({
  userUuid,
  otherNickname,
  page,
  onPageChange,
}: ListProps) {
  const { data, isLoading, isError } = useCommentList({
    user_uuid: userUuid,
    offset: (page - 1) * PAGE_SIZE.comments,
    limit: PAGE_SIZE.comments,
  });

  if (isLoading) return <RowSkeletons />;
  if (isError || !data) return <LoadError />;
  if (data.count === 0) {
    return (
      <Empty
        icon={<MessageSquare />}
        title="아직 단 댓글이 없어요"
        body={
          otherNickname
            ? `${otherNickname}님이 댓글을 달면 여기에 보여요.`
            : undefined
        }
      />
    );
  }

  return (
    <>
      <ul className="px-4 md:px-7">
        {data.rows.map((comment) => {
          const link = commentLink(comment.content);
          return (
            <li key={comment.comment_id}>
              <Link
                to={link.to}
                params={link.params}
                search={link.search}
                className="flex flex-col gap-1.5 border-b border-gray-100 py-3.5 md:py-4"
              >
                <span className="line-clamp-2 text-body break-words">
                  {comment.text}
                </span>
                <span className="flex min-w-0 items-center gap-1.5 text-caption text-fg-muted">
                  <CornerUpLeft className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">
                    {comment.content.board.board_name} ·{' '}
                    {comment.content.title || '제목 없음'}
                  </span>
                  <span className="shrink-0">
                    · {formatListDate(comment.createdAt)}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <ListPagination
        page={page}
        count={data.count}
        pageSize={PAGE_SIZE.comments}
        onPageChange={onPageChange}
      />
    </>
  );
}

type ActivityListProps = {
  userUuid: string;
  otherNickname?: string;
  tab: ActivityTab;
  page: number;
};

/** 게시글 / 사진 / 댓글 tabs, kept in the `tab` and `page` search params. */
export default function ActivityList({
  userUuid,
  otherNickname,
  tab,
  page,
}: ActivityListProps) {
  const navigate = useNavigate();
  const listProps: ListProps = {
    userUuid,
    otherNickname,
    page,
    onPageChange: (next) =>
      navigate({ to: '.', search: (prev) => ({ ...prev, page: next }) }),
  };

  return (
    <div className="flex flex-1 flex-col bg-surface md:min-h-[640px] md:rounded-xl md:shadow-sm">
      <Tabs
        value={tab}
        onValueChange={(next) =>
          navigate({
            to: '.',
            search: (prev) => ({
              ...prev,
              tab: next as ActivityTab,
              page: undefined,
            }),
            replace: true,
          })
        }
      >
        <TabsList aria-label="활동" className="gap-6 px-4 md:gap-7 md:px-7">
          {TABS.map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="min-h-12 text-[15px] md:min-h-14 md:text-base"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {
        {
          posts: <PostList {...listProps} />,
          photos: <PhotoList {...listProps} />,
          comments: <CommentList {...listProps} />,
        }[tab]
      }
    </div>
  );
}
