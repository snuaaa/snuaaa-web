import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { Megaphone, Telescope } from 'lucide-react';
import ContentTypeEnum from '~/common/ContentTypeEnum';
import { Button, Tag } from '~/components/ui';
import { ASTRO_PHOTO_BOARD, MEMORY_BOARD } from '~/components/Layout/constants';
import { useBoards } from '~/hooks/queries/useBoardQueries';
import { resolveImageUrl } from '~/lib/utils';
import { SoundBoxResponse } from '~/services/HomeService';
import { Album, Content, Photo } from '~/services/types';
import { convertDynamicTime } from '~/utils/convertDate';
import { getThumbnailPath } from '~/utils/getThumbnailPath';

const NOTICE_MENU = 1;

function Card({
  title,
  action,
  children,
}: {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-lg bg-surface p-[18px] shadow-sm">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-heading">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

const moreLinkClassName = 'text-label font-normal text-gray-700 hover:text-fg';

const plainText = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** The latest 소리통 post, pinned above everything else. */
export function SoundBoxCard({ soundBox }: { soundBox?: SoundBoxResponse }) {
  if (!soundBox?.content_id) return null;
  return (
    <Link
      to="/post/$post_id"
      params={{ post_id: String(soundBox.content_id) }}
      className="flex items-start gap-3.5 rounded-lg bg-surface p-[18px] shadow-sm transition-colors hover:bg-gray-50"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent-soft text-navy-900">
        <Megaphone className="size-5" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-micro text-fg-muted">소리통</span>
        <span className="truncate text-body font-semibold">
          {soundBox.title}
        </span>
        {soundBox.text && (
          <span className="line-clamp-2 text-caption text-fg-muted">
            {plainText(soundBox.text)}
          </span>
        )}
      </span>
    </Link>
  );
}

export function RecentPostsCard({ posts }: { posts: Content[] }) {
  const { boardsInfo } = useBoards();
  const isNotice = (boardId: string) =>
    boardsInfo.find((b) => b.board_id === boardId)?.menu === NOTICE_MENU;

  return (
    <Card
      title="새 글"
      action={
        <Link to="/posts/all" className={moreLinkClassName}>
          전체보기
        </Link>
      }
    >
      <ul>
        {posts.map((post) => {
          const isDocument = post.type === ContentTypeEnum.DOCUMENT;
          return (
            <li key={post.content_id} className="border-t border-gray-100">
              <Link
                {...(isDocument
                  ? {
                      to: '/document/$doc_id',
                      params: { doc_id: String(post.content_id) },
                    }
                  : {
                      to: '/post/$post_id',
                      params: { post_id: String(post.content_id) },
                    })}
                className="flex flex-col gap-1 py-2.5 hover:text-navy-700"
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <Tag
                    variant={
                      isNotice(post.board.board_id) ? 'brand' : 'neutral'
                    }
                  >
                    {post.board.board_name}
                  </Tag>
                  <span className="truncate text-body font-medium">
                    {post.title}
                  </span>
                </span>
                <span className="text-caption text-fg-muted">
                  {convertDynamicTime(post.updatedAt ?? post.createdAt)}
                  {post.comment_num > 0 && ` · 댓글 ${post.comment_num}`}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function SectionHeader({ title, boardId }: { title: string; boardId: string }) {
  return (
    <div className="flex items-center justify-between px-0.5">
      <h2 className="text-heading">{title}</h2>
      <Link
        to="/board/$board_id"
        params={{ board_id: boardId }}
        className={moreLinkClassName}
      >
        전체보기
      </Link>
    </div>
  );
}

/** The latest 추억 만들기 albums. */
export function RecentAlbumsSection({ albums }: { albums: Album[] }) {
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader title="새 앨범" boardId={MEMORY_BOARD} />
      <ul className="grid grid-cols-2 gap-1.5">
        {albums.slice(0, 4).map((album) => {
          const thumbnail = getThumbnailPath(album);
          return (
            <li key={album.content_id}>
              <Link
                to="/album/$album_id"
                params={{ album_id: String(album.content_id) }}
                className="group relative block aspect-[4/3] overflow-hidden rounded-md bg-navy-800"
              >
                {thumbnail && (
                  <img
                    src={resolveImageUrl(thumbnail)}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover transition-transform group-hover:scale-105"
                  />
                )}
                <span className="absolute inset-x-0 bottom-0 truncate bg-linear-to-t from-navy-950/80 to-transparent px-3 pt-6 pb-2 text-label text-fg-on-brand">
                  {album.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** The latest 별사진 photos, opened in the photo modal. */
export function RecentPhotosSection({ photos }: { photos: Photo[] }) {
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader title="새 사진" boardId={ASTRO_PHOTO_BOARD} />
      <ul className="grid grid-cols-3 gap-1.5">
        {photos.slice(0, 6).map((photo) => (
          <li key={photo.content_id}>
            <Link
              to="."
              search={(prev) => ({ ...prev, photo: photo.content_id })}
              className="block aspect-square overflow-hidden rounded-md bg-navy-800"
              aria-label={photo.title || '사진 보기'}
            >
              <img
                src={resolveImageUrl(
                  photo.photo?.thumbnail_url ?? photo.photo?.thumbnail_path,
                )}
                alt=""
                loading="lazy"
                className="size-full object-cover transition-transform hover:scale-105"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EquipmentCard() {
  return (
    <div className="flex items-center gap-3.5 rounded-lg bg-surface p-[18px] shadow-sm">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-accent-soft text-navy-900">
        <Telescope className="size-6" aria-hidden />
      </span>
      <span className="flex flex-1 flex-col gap-1">
        <span className="text-body font-semibold">장비 대여</span>
        <span className="text-caption text-fg-muted">
          망원경 · 가대 · 카메라 예약
        </span>
      </span>
      <Button asChild>
        <Link to="/equipment">예약</Link>
      </Button>
    </div>
  );
}
