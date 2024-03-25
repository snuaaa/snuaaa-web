import PhotoList from 'components/Album/PhotoList';
import Loading from 'components/Common/Loading';
import Paginator from 'components/Common/Paginator';
import Tag from 'components/Common/Tag';
import { CreatePhoto } from 'components/Photo/CreatePhoto';
import AuthContext from 'contexts/AuthContext';
import { useFetch } from 'hooks/useFetch';
import {
  ChangeEvent,
  FC,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import PhotoBoardService from 'services/PhotoBoardService';
import { Board } from 'services/types';

const PHOTO_ROW_NUM = 12;

type Props = {
  boardInfo: Board;
};

type LocationState = {
  page: number;
  tags: string[];
};

export const PhotoSection: FC<Props> = ({ boardInfo }) => {
  const authContext = useContext(AuthContext);

  const [isCreating, setIsCreating] = useState(false);

  const location = useLocation<LocationState>();

  const pageIdx = location.state?.page ?? 1;
  const selectedTags = useMemo(
    () => (location.state?.tags?.length > 0 ? location.state.tags : []),
    [location.state?.tags],
  );

  const fetchFunction = useCallback(() => {
    return PhotoBoardService.retrievePhotosInPhotoBoard(
      boardInfo.board_id,
      pageIdx,
      selectedTags,
    );
  }, [boardInfo.board_id, pageIdx, selectedTags]);

  const { data, refresh } = useFetch({ fetch: fetchFunction });

  const history = useHistory();

  const clickAll = () => {
    history.push({
      state: {
        ...location.state,
        page: 1,
        tags: [],
      },
    });
  };

  const clickTag = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedTags =
      location.state && location.state.tags && location.state.tags.length > 0
        ? location.state.tags
        : [];

    const tagId = e.target.id;

    if (selectedTags.includes(tagId)) {
      history.replace({
        state: {
          ...location.state,
          page: 1,
          tags: selectedTags.filter((tag) => tagId !== tag),
        },
      });
    } else {
      history.replace({
        state: {
          ...location.state,
          page: 1,
          tags: selectedTags.concat(tagId),
        },
      });
    }
  };

  const clickPage = (idx: number) => {
    history.push({
      state: {
        ...location.state,
        page: idx,
      },
    });
  };

  const handleCreatePhoto = useCallback(() => {
    refresh();
    setIsCreating(false);
  }, [refresh]);

  if (!data) {
    return <Loading />;
  }

  return (
    <>
      <div className="board-search-wrapper">
        <div className="board-search-input">
          <i className="ri-search-line enif-f-1x"></i>
          <input type="text" />
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
          <div className="enif-divider"></div>
          <PhotoList photos={data.photoInfo ?? []} />
          {isCreating && (
            <CreatePhoto
              boardId={boardInfo.board_id}
              tags={boardInfo.tags}
              onCreatePhoto={handleCreatePhoto}
              onCancel={() => setIsCreating(false)}
            />
          )}
        </>
      )}
      {data.photoCount > 0 && (
        <Paginator
          pageIdx={pageIdx}
          pageNum={Math.ceil(data.photoCount / PHOTO_ROW_NUM)}
          clickPage={clickPage}
        />
      )}
    </>
  );
};
