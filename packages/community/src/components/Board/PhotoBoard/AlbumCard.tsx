import { Link } from '@tanstack/react-router';
import { Images } from 'lucide-react';
import Skeleton from '~/components/Common/Skeleton';
import { Tag } from '~/components/ui';
import { resolveImageUrl } from '~/lib/utils';
import { Album } from '~/services/types';
import { getThumbnailPath } from '~/utils/getThumbnailPath';
import { formatListDate } from '../boardUtils';

const listClassName =
  'grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:gap-5 lg:grid-cols-3';

/**
 * Album cards: the cover photo over the category and title.
 * TODO: the canvas shows a three-photo mosaic and the photo count, which
 * need new fields on the album list API (`main`) first.
 */
export function AlbumCardList({ albums }: { albums: Album[] }) {
  return (
    <ul className={listClassName}>
      {albums.map((album) => {
        const thumbnail = getThumbnailPath(album);
        return (
          <li key={album.content_id}>
            <Link
              to="/album/$album_id"
              params={{ album_id: String(album.content_id) }}
              className="group flex flex-col overflow-hidden rounded-lg bg-surface shadow-sm"
            >
              <span className="flex aspect-[2/1] items-center justify-center overflow-hidden bg-navy-800 text-navy-500">
                {thumbnail ? (
                  <img
                    src={resolveImageUrl(thumbnail)}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover transition-transform group-hover:scale-[1.03]"
                  />
                ) : (
                  <Images className="size-8" strokeWidth={1.5} aria-hidden />
                )}
              </span>
              <span className="flex flex-col gap-1 px-4 pt-3 pb-3.5">
                <span className="flex min-w-0 items-center gap-1.5">
                  {album.category && <Tag>{album.category.category_name}</Tag>}
                  <span className="truncate text-base font-semibold group-hover:text-navy-700 md:text-body">
                    {album.title}
                  </span>
                </span>
                <span className="text-caption text-fg-muted">
                  {album.user?.nickname && `${album.user.nickname} · `}
                  {formatListDate(album.createdAt)}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AlbumCardListSkeleton() {
  return (
    <ul
      className={listClassName}
      aria-busy="true"
      aria-label="앨범 불러오는 중"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <li
          key={i}
          className="flex flex-col overflow-hidden rounded-lg bg-surface shadow-sm"
        >
          <Skeleton className="aspect-[2/1] rounded-none" />
          <span className="flex flex-col gap-2 px-4 pt-3 pb-3.5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-24" />
          </span>
        </li>
      ))}
    </ul>
  );
}
