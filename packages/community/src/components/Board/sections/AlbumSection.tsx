import CreateAlbum from 'components/Album/CreateAlbum';
import Loading from 'components/Common/Loading';
import Paginator from 'components/Common/Paginator';
import AlbumList from 'components/PhotoBoard/AlbumList';
import AuthContext from 'contexts/AuthContext';
import { useFetch } from 'hooks/useFetch';
import { FC, useCallback, useContext, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import PhotoBoardService from 'services/PhotoBoardService';
import { Board } from 'services/types';

const ALBUM_ROW_NUM = 12;

type Props = {
  boardInfo: Board;
};

type LocationState = {
  page: number;
};

export const AlbumSection: FC<Props> = ({ boardInfo }) => {
  const authContext = useContext(AuthContext);

  const [isCreating, setIsCreating] = useState(false);

  const location = useLocation<LocationState>();

  const pageIdx = location.state?.page ?? 1;

  const fetchFunction = useCallback(() => {
    return PhotoBoardService.retrieveAlbumsInPhotoBoard(
      boardInfo.board_id,
      pageIdx,
    );
  }, [boardInfo.board_id, pageIdx]);

  const { data, refresh } = useFetch({ fetch: fetchFunction });

  const history = useHistory();

  const clickPage = (idx: number) => {
    history.push({
      state: {
        ...location.state,
        page: idx,
      },
    });
  };

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
              <i className="ri-gallery-line enif-f-1p2x"></i>앨범 생성
            </button>
          )}
        </div>
      </div>
      <div className="enif-divider"></div>
      <AlbumList
        board_id={boardInfo.board_id}
        albums={data?.data.albumInfo ?? []}
      />
      {isCreating && (
        <CreateAlbum
          board_id={boardInfo.board_id}
          onCreate={() => {
            setIsCreating(false);
            refresh();
          }}
          onCancel={() => setIsCreating(false)}
        />
      )}
      {data.data.albumCount > 0 && (
        <Paginator
          pageIdx={pageIdx}
          pageNum={Math.ceil(data.data.albumCount / ALBUM_ROW_NUM)}
          clickPage={clickPage}
        />
      )}
    </>
  );
};
