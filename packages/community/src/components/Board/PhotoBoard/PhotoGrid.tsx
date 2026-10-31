import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Heart, MessageCircle } from 'lucide-react';
import Skeleton from '~/components/Common/Skeleton';
import { cn, resolveImageUrl } from '~/lib/utils';
import { Photo } from '~/services/types';

const COLUMN_QUERIES: [string, number][] = [
  ['(min-width: 1024px)', 4],
  ['(min-width: 768px)', 3],
];

/** 2 columns on phones, 3 on tablets, 4 on wide screens. */
function useColumnCount() {
  const count = () =>
    COLUMN_QUERIES.find(([query]) => window.matchMedia(query).matches)?.[1] ??
    2;
  const [columns, setColumns] = useState(count);

  useEffect(() => {
    const lists = COLUMN_QUERIES.map(([query]) => window.matchMedia(query));
    const update = () => setColumns(count());
    lists.forEach((list) => list.addEventListener('change', update));
    return () =>
      lists.forEach((list) => list.removeEventListener('change', update));
  }, []);

  return columns;
}

/** Deals items into columns left to right, so newer photos stay on top. */
function toColumns<T>(items: T[], columns: number) {
  return Array.from({ length: columns }, (_, col) =>
    items.filter((_, i) => i % columns === col),
  );
}

const gridClassName = 'flex gap-1 md:gap-2';
const columnClassName = 'flex min-w-0 flex-1 flex-col gap-1 md:gap-2';

/**
 * Masonry grid of photos. Each photo keeps its own aspect ratio and opens
 * in the photo modal through the `?photo=` search param.
 */
export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const columns = useColumnCount();

  return (
    <div className={gridClassName}>
      {toColumns(photos, columns).map((column, col) => (
        <ul key={col} className={columnClassName}>
          {column.map((photo) => (
            <li key={photo.content_id}>
              <Link
                to="."
                search={(prev) => ({ ...prev, photo: photo.content_id })}
                className="group relative block overflow-hidden rounded-sm bg-navy-800 md:rounded-md"
              >
                <img
                  src={resolveImageUrl(
                    photo.photo.thumbnail_url ?? photo.photo.thumbnail_path,
                  )}
                  alt={photo.title || '사진'}
                  loading="lazy"
                  className="block min-h-24 w-full object-cover"
                />
                <span
                  className="absolute inset-x-0 bottom-0 hidden items-center gap-3 bg-linear-to-t from-navy-950/70 to-transparent px-3 pt-8 pb-2 text-caption text-fg-on-brand opacity-0 transition-opacity group-hover:opacity-100 md:flex"
                  aria-hidden
                >
                  <span className="flex items-center gap-1">
                    <Heart className="size-3.5" />
                    {photo.like_num}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="size-3.5" />
                    {photo.comment_num}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

const SKELETON_HEIGHTS = [180, 240, 150, 220, 190, 230, 160, 210];

export function PhotoGridSkeleton({ className }: { className?: string }) {
  const columns = useColumnCount();
  return (
    <div
      className={cn(gridClassName, className)}
      aria-busy="true"
      aria-label="사진 불러오는 중"
    >
      {toColumns(SKELETON_HEIGHTS, columns).map((column, col) => (
        <div key={col} className={columnClassName}>
          {column.map((height, i) => (
            <Skeleton
              key={i}
              className="rounded-sm md:rounded-md"
              style={{ height: height - col * 20 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
