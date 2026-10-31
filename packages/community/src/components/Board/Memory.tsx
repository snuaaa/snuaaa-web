import { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { FolderPlus } from 'lucide-react';

import AlbumFormSheet from '~/components/Album/AlbumFormSheet';
import { Button, Fab, Pagination } from '~/components/ui';
import { useAuth } from '~/contexts/auth';
import { useAlbumsInPhotoBoard } from '~/hooks/queries/useAlbumQueries';
import { cn } from '~/lib/utils';
import { Board } from '~/services/types';
import { canWrite } from './boardUtils';
import { AlbumCardList, AlbumCardListSkeleton } from './PhotoBoard/AlbumCard';
import PhotoEmpty from './PhotoBoard/PhotoEmpty';
import PhotoTabLayout from './PhotoBoard/PhotoTabLayout';

/** Fixed by the API (`photoboard/:id/albums`). */
const PAGE_SIZE = 12;

const chipClassName = (selected: boolean) =>
  cn(
    'flex h-[34px] shrink-0 items-center rounded-full border px-3.5 text-label transition-colors',
    selected
      ? 'border-primary bg-primary text-white'
      : 'border-border bg-surface font-medium text-gray-700 hover:border-gray-300',
  );

type MemoryProps = {
  boardInfo: Board;
};

/** 추억 만들기: album cards filtered by category. */
function Memory({ boardInfo }: MemoryProps) {
  const navigate = useNavigate({ from: '/board/$board_id' });
  const searchParams = useSearch({ from: '/board/$board_id' });
  const {
    authInfo: {
      user: { grade },
    },
  } = useAuth();
  const writable = canWrite(boardInfo, grade);

  const [isCreating, setIsCreating] = useState(false);

  const page = Number(searchParams.page ?? 1);
  const category = searchParams.category || undefined;

  const { data, isLoading, isError, refetch } = useAlbumsInPhotoBoard(
    boardInfo.board_id,
    page,
    category,
  );

  const setCategory = (next?: string) => {
    navigate({
      search: (prev) => ({ ...prev, category: next, page: 1 }),
    });
  };

  const goToPage = (idx: number) => {
    navigate({
      search: (prev) => ({ ...prev, page: idx }),
    });
  };

  const categoryName = boardInfo.categories.find(
    (cate) => cate.category_id === category,
  )?.category_name;

  const createButton = (
    <Button onClick={() => setIsCreating(true)} className="[&_svg]:text-accent">
      <FolderPlus className="size-[18px]!" />
      앨범 만들기
    </Button>
  );

  const categoryChips = boardInfo.categories.length > 0 && (
    <div
      role="group"
      aria-label="카테고리"
      className="flex gap-2 overflow-x-auto border-b border-gray-100 bg-surface px-4 py-3 [scrollbar-width:none] md:border-0 md:bg-transparent md:p-0"
    >
      <button
        type="button"
        aria-pressed={!category}
        onClick={() => setCategory(undefined)}
        className={chipClassName(!category)}
      >
        전체
      </button>
      {boardInfo.categories.map((cate) => {
        const selected = category === cate.category_id;
        return (
          <button
            key={cate.category_id}
            type="button"
            aria-pressed={selected}
            onClick={() => setCategory(cate.category_id)}
            className={chipClassName(selected)}
          >
            {cate.category_name}
          </button>
        );
      })}
    </div>
  );

  return (
    <PhotoTabLayout board={boardInfo} action={writable && createButton}>
      {categoryChips}
      <div className="px-4 pt-3.5 md:p-0">
        {isError ? (
          <PhotoEmpty
            title="앨범을 불러오지 못했어요"
            action={
              <Button variant="secondary" onClick={() => refetch()}>
                다시 시도
              </Button>
            }
          />
        ) : isLoading || !data ? (
          <AlbumCardListSkeleton />
        ) : data.albumInfo.length === 0 ? (
          <PhotoEmpty
            title={
              categoryName
                ? `${categoryName} 앨범이 아직 없어요`
                : '아직 앨범이 없어요'
            }
            description={
              writable ? '모임 사진을 모아 첫 앨범을 만들어 보세요.' : undefined
            }
            action={writable && createButton}
          />
        ) : (
          <AlbumCardList albums={data.albumInfo} />
        )}
        <Pagination
          page={page}
          totalPages={Math.ceil((data?.albumCount ?? 0) / PAGE_SIZE)}
          onPageChange={goToPage}
          className="py-4"
        />
      </div>

      {writable && (
        <>
          <div className="h-18 md:hidden" aria-hidden />
          <Fab
            icon={<FolderPlus />}
            onClick={() => setIsCreating(true)}
            className="md:hidden"
          >
            앨범 만들기
          </Fab>
        </>
      )}
      <AlbumFormSheet
        open={isCreating}
        onOpenChange={setIsCreating}
        categories={boardInfo.categories}
        boardId={boardInfo.board_id}
        onSaved={() => setIsCreating(false)}
      />
    </PhotoTabLayout>
  );
}

export default Memory;
