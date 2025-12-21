import PhotoList from '~/components/Album/PhotoList';
import Loading from '~/components/Common/Loading';
import Pagination from '~/components/Common/Pagination';
import Tag from '~/components/Common/Tag';
import CreatePhotoModal from '~/components/Photo/CreateModal';
import { useAuth } from '~/contexts/auth';
import { usePhotoList } from '~/hooks/queries/usePhotoQueries';
import useQueryString from '~/hooks/useQueryString';
import { ChangeEvent, FC, useCallback, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Board } from '~/services/types';
import { Divider } from '~/ui';

const PHOTO_ROW_NUM = 12;

type Props = {
  boardInfo: Board;
};

export const PhotoSection: FC<Props> = ({ boardInfo }) => {
  const authContext = useAuth();
  const history = useHistory();
  const location = useLocation();
  const queryString = useQueryString();

  const [isCreating, setIsCreating] = useState(false);

  const pageIdx = Number(queryString.get('page') || 1);
  const selectedTags = useMemo(
    () => queryString.getAll('tags') ?? [],
    [queryString],
  );

  const { data, isPending } = usePhotoList({
    board_id: boardInfo.board_id,
    offset: (pageIdx - 1) * PHOTO_ROW_NUM,
    limit: PHOTO_ROW_NUM,
    tags: selectedTags,
  });

  const clickAll = () => {
    history.push({
      search: '',
    });
  };

  const clickTag = (e: ChangeEvent<HTMLInputElement>) => {
    const tagId = e.target.id;
    const nextSearchParams = new URLSearchParams(queryString);

    // Note: URLSearchParams doesn't have a simple toggle or array set method for same key
    // We need to reconstruct the tags
    const currentTags = nextSearchParams.getAll('tags');
    nextSearchParams.delete('tags');

    if (currentTags.includes(tagId)) {
      currentTags
        .filter((tag) => tagId !== tag)
        .forEach((tag) => nextSearchParams.append('tags', tag));
    } else {
      [...currentTags, tagId].forEach((tag) =>
        nextSearchParams.append('tags', tag),
      );
    }
    
    // Reset page when filtering
    nextSearchParams.set('page', '1');

    history.push({
      search: nextSearchParams.toString(),
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
          routeGenerator={(page) => {
            const nextSearchParam = new URLSearchParams(queryString);
            nextSearchParam.set('page', page.toString());
            return `${location.pathname}?${nextSearchParam.toString()}`;
          }}
        />
      )}
    </>
  );
};
