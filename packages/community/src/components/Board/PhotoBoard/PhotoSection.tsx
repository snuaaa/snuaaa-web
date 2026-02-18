import { useNavigate, useSearch } from '@tanstack/react-router';
import PhotoList from '~/components/Album/PhotoList';
import Loading from '~/components/Common/Loading';
import Pagination from '~/components/Common/Pagination';
import Tag from '~/components/Common/Tag';
import CreatePhotoModal from '~/components/Photo/CreateModal';
import { useAuth } from '~/contexts/auth';
import { usePhotoList } from '~/hooks/queries/usePhotoQueries';
import { ChangeEvent, FC, useCallback, useMemo, useState } from 'react';
import { Board } from '~/services/types';
import { Divider } from '~/ui';

const PHOTO_ROW_NUM = 12;

type Props = {
  boardInfo: Board;
};

export const PhotoSection: FC<Props> = ({ boardInfo }) => {
  const authContext = useAuth();
  const navigate = useNavigate({ from: '/board/$board_id' });
  const searchParams = useSearch({ from: '/board/$board_id' });

  const [isCreating, setIsCreating] = useState(false);

  const pageIdx = Number(searchParams.page || 1);
  const selectedTags = useMemo(
    () => searchParams.tags || [],
    [searchParams.tags],
  );

  const { data, isPending } = usePhotoList({
    board_id: boardInfo.board_id,
    offset: (pageIdx - 1) * PHOTO_ROW_NUM,
    limit: PHOTO_ROW_NUM,
    tags: selectedTags,
  });

  const clickAll = () => {
    navigate({
      search: (prev) => {
        const { tags, ...rest } = prev;
        return rest;
      },
    });
  };

  const clickTag = (e: ChangeEvent<HTMLInputElement>) => {
    const tagId = e.target.id;

    navigate({
      search: (prev) => {
        const currentTags: string[] = prev.tags || [];
        let newTags;
        if (currentTags.includes(tagId)) {
          newTags = currentTags.filter((tag) => tagId !== tag);
        } else {
          newTags = [...currentTags, tagId];
        }
        return {
          ...prev,
          tags: newTags,
          page: 1,
        };
      },
    });
  };

  const handleCreatePhoto = useCallback(() => {
    setIsCreating(false);
  }, []);

  if (isPending || !data) {
    return <Loading />;
  }

  return (
    <>
      <div className="board-search-wrapper">
        <div className="board-search-input">
          {/* <i className="ri-search-line text-base"></i>
          <input type="text" /> */}
        </div>
        <div>
          {authContext.authInfo.user.grade <= boardInfo.lv_write && (
            <button
              className="board-btn-write"
              onClick={() => setIsCreating(true)}
            >
              <i className="ri-image-line enif-f-1p2x"></i>사진 업로드
            </button>
          )}
        </div>
      </div>
      {boardInfo.tags && (
        <>
          <Tag
            tags={boardInfo.tags}
            clickAll={clickAll}
            selectedTags={selectedTags}
            clickTag={clickTag}
          />
          <Divider />
          <PhotoList photos={data.rows ?? []} />
          {isCreating && (
            <CreatePhotoModal
              boardId={boardInfo.board_id}
              tags={boardInfo.tags}
              onCreatePhoto={handleCreatePhoto}
              onCancel={() => setIsCreating(false)}
            />
          )}
        </>
      )}
      {data.count > 0 && (
        <Pagination
          currentPage={pageIdx}
          totalPageCount={Math.ceil(data.count / PHOTO_ROW_NUM)}
          searchGenerator={(page) => ({
            ...searchParams,
            page,
          })}
        />
      )}
    </>
  );
};
