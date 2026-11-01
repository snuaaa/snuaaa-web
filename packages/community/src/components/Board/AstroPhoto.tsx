import { useMemo, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { FolderPlus, Upload } from 'lucide-react';

import AlbumFormSheet from '~/components/Album/AlbumFormSheet';
import PhotoUploader from '~/components/Photo/PhotoUploader';
import { Button, Fab, Pagination } from '~/components/ui';
import { useAuth } from '~/contexts/auth';
import { useAlbumsInPhotoBoard } from '~/hooks/queries/useAlbumQueries';
import { usePhotoList } from '~/hooks/queries/usePhotoQueries';
import { Board } from '~/services/types';
import { canWrite } from './boardUtils';
import { SearchType, useBoardSearch } from './useBoardSearch';
import { AlbumCardList, AlbumCardListSkeleton } from './PhotoBoard/AlbumCard';
import PhotoEmpty from './PhotoBoard/PhotoEmpty';
import { PhotoGrid, PhotoGridSkeleton } from './PhotoBoard/PhotoGrid';
import PhotoTabLayout from './PhotoBoard/PhotoTabLayout';
import {
  DesktopTagFilter,
  MobileTagFilterBar,
  PhotoView,
} from './PhotoBoard/TagFilter';

const PHOTO_PAGE_SIZE = 24;
/** Fixed by the API (`photoboard/:id/albums`). */
const ALBUM_PAGE_SIZE = 12;

type SearchProps = {
  keyword?: string;
  searchType: SearchType;
};

const searchEmpty = (description: string) => (
  <PhotoEmpty title="검색 결과가 없어요" description={description} />
);

function PhotoSection({
  query,
  tags,
  keyword,
  page,
  onPageChange,
  onResetTags,
}: {
  query: ReturnType<typeof usePhotoList>;
  tags: string[];
  page: number;
  onPageChange: (page: number) => void;
  onResetTags: () => void;
} & Pick<SearchProps, 'keyword'>) {
  const { data, isLoading, isError, refetch } = query;

  if (isError) {
    return (
      <PhotoEmpty
        title="사진을 불러오지 못했어요"
        action={
          <Button variant="secondary" onClick={() => refetch()}>
            다시 시도
          </Button>
        }
      />
    );
  }
  if (isLoading || !data) return <PhotoGridSkeleton />;
  if (data.rows.length === 0) {
    if (keyword) {
      return searchEmpty(
        tags.length > 0
          ? '태그 필터를 빼거나 다른 검색어로 찾아보세요.'
          : '다른 검색어나 검색 범위로 찾아보세요.',
      );
    }
    return tags.length > 0 ? (
      <PhotoEmpty
        title="고른 태그에 맞는 사진이 없어요"
        description="태그를 하나씩 빼 보거나 필터를 초기화해 보세요."
        action={
          <Button variant="secondary" onClick={onResetTags}>
            필터 초기화
          </Button>
        }
      />
    ) : (
      <PhotoEmpty title="아직 사진이 없어요" />
    );
  }

  return (
    <>
      <PhotoGrid photos={data.rows} />
      <Pagination
        page={page}
        totalPages={Math.ceil(data.count / PHOTO_PAGE_SIZE)}
        onPageChange={onPageChange}
        className="py-4"
      />
    </>
  );
}

function AlbumSection({
  query,
  keyword,
  searchType,
  page,
  onPageChange,
}: {
  query: ReturnType<typeof useAlbumsInPhotoBoard>;
  page: number;
  onPageChange: (page: number) => void;
} & SearchProps) {
  const { data, isLoading, isError, refetch } = query;

  if (isError) {
    return (
      <PhotoEmpty
        title="앨범을 불러오지 못했어요"
        action={
          <Button variant="secondary" onClick={() => refetch()}>
            다시 시도
          </Button>
        }
      />
    );
  }
  if (isLoading || !data) return <AlbumCardListSkeleton />;
  if (data.albumInfo.length === 0) {
    return keyword ? (
      searchEmpty('다른 검색어나 검색 범위로 찾아보세요.')
    ) : (
      <PhotoEmpty title="아직 앨범이 없어요" />
    );
  }

  return (
    <>
      <AlbumCardList
        albums={data.albumInfo}
        keyword={keyword}
        searchType={searchType}
      />
      <Pagination
        page={page}
        totalPages={Math.ceil(data.albumCount / ALBUM_PAGE_SIZE)}
        onPageChange={onPageChange}
        className="py-4"
      />
    </>
  );
}

type AstroPhotoProps = {
  boardInfo: Board;
};

/**
 * 별사진: a masonry wall of photos with tag filters, or its albums. Search
 * applies to whichever is shown, together with the tag filters.
 */
function AstroPhoto({ boardInfo }: AstroPhotoProps) {
  const navigate = useNavigate({ from: '/board/$board_id' });
  const searchParams = useSearch({ from: '/board/$board_id' });
  const {
    authInfo: {
      user: { grade },
    },
  } = useAuth();
  const writable = canWrite(boardInfo, grade);

  const [isCreating, setIsCreating] = useState(false);

  const view: PhotoView = searchParams.view === 'album' ? 'album' : 'photo';
  const page = Number(searchParams.page ?? 1);
  const tags = useMemo(() => searchParams.tags ?? [], [searchParams.tags]);

  const search = useBoardSearch();
  const { keyword, searchType } = search;
  const searchQuery = keyword
    ? { search_type: searchType, search_keyword: keyword }
    : undefined;

  // Both lists are read here so the layout can show the result count.
  const photoQuery = usePhotoList(
    {
      board_id: boardInfo.board_id,
      offset: (page - 1) * PHOTO_PAGE_SIZE,
      limit: PHOTO_PAGE_SIZE,
      tags,
      ...searchQuery,
    },
    { enabled: view === 'photo' },
  );
  const albumQuery = useAlbumsInPhotoBoard(
    boardInfo.board_id,
    page,
    undefined,
    searchQuery,
    { enabled: view === 'album' },
  );
  const resultCount =
    view === 'photo' ? photoQuery.data?.count : albumQuery.data?.albumCount;

  const setView = (next: PhotoView) => {
    navigate({
      search: (prev) => ({ ...prev, view: next, page: 1 }),
    });
  };

  const setTags = (next: string[]) => {
    navigate({
      search: (prev) => ({
        ...prev,
        tags: next.length > 0 ? next : undefined,
        page: 1,
      }),
    });
  };

  const goToPage = (idx: number) => {
    navigate({
      search: (prev) => ({ ...prev, page: idx }),
    });
  };

  const actionLabel = view === 'photo' ? '사진 올리기' : '앨범 만들기';
  const ActionIcon = view === 'photo' ? Upload : FolderPlus;

  const filterProps = {
    tags: boardInfo.tags ?? [],
    selected: tags,
    onChange: setTags,
    view,
    onViewChange: setView,
  };

  return (
    <PhotoTabLayout
      board={boardInfo}
      toolbar={<MobileTagFilterBar {...filterProps} />}
      search={search}
      resultCount={resultCount}
      action={
        writable && (
          <Button
            onClick={() => setIsCreating(true)}
            className="[&_svg]:text-accent"
          >
            <ActionIcon className="size-[18px]!" />
            {actionLabel}
          </Button>
        )
      }
    >
      <div className="flex flex-col p-1 md:grid md:grid-cols-[200px_minmax(0,1fr)] md:items-start md:gap-7 md:p-0">
        <DesktopTagFilter {...filterProps} />
        <div className={view === 'album' ? 'px-3 pt-3 md:p-0' : undefined}>
          {view === 'photo' ? (
            <PhotoSection
              query={photoQuery}
              keyword={keyword}
              tags={tags}
              page={page}
              onPageChange={goToPage}
              onResetTags={() => setTags([])}
            />
          ) : (
            <AlbumSection
              query={albumQuery}
              keyword={keyword}
              searchType={searchType}
              page={page}
              onPageChange={goToPage}
            />
          )}
        </div>
      </div>

      {writable && (
        <>
          <div className="h-18 md:hidden" aria-hidden />
          <Fab
            icon={<ActionIcon />}
            onClick={() => setIsCreating(true)}
            className="md:hidden"
          >
            {actionLabel}
          </Fab>
        </>
      )}
      {isCreating && view === 'photo' && (
        <PhotoUploader
          boardId={boardInfo.board_id}
          targetName={boardInfo.board_name}
          tags={boardInfo.tags}
          onCreatePhoto={() => setIsCreating(false)}
          onCancel={() => setIsCreating(false)}
        />
      )}
      <AlbumFormSheet
        open={isCreating && view === 'album'}
        onOpenChange={setIsCreating}
        boardId={boardInfo.board_id}
        onSaved={() => setIsCreating(false)}
      />
    </PhotoTabLayout>
  );
}

export default AstroPhoto;
