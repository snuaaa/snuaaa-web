import { useState, useCallback, useContext } from 'react';

import CreateAlbum from '../Album/CreateAlbum';
import AlbumList from '../../components/PhotoBoard/AlbumList';
import Category from '../../components/Common/Category';
import Loading from '../../components/Common/Loading';
import Paginator from '../../components/Common/Paginator';
import PhotoBoardService from '../../services/PhotoBoardService';

import BoardName from '../../components/Board/BoardName';
import AuthContext from '../../contexts/AuthContext';

import { useHistory, useLocation } from 'react-router';
import { Board } from 'services/types';
import { useFetch } from 'hooks/useFetch';

const ALBUMROWNUM = 12;

type MemoryProps = {
  boardInfo: Board;
};

type LocationState = {
  page: number;
  category: string;
};

function Memory({ boardInfo }: MemoryProps) {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const history = useHistory();
  const location = useLocation<LocationState>();

  const pageIdx = location.state?.page ?? 1;
  const category = location.state?.category;

  const fetchFunction = useCallback(() => {
    return PhotoBoardService.retrieveAlbumsInPhotoBoard(
      boardInfo.board_id,
      pageIdx,
      category,
    );
  }, [boardInfo.board_id, category, pageIdx]);

  const { data, refresh } = useFetch({ fetch: fetchFunction });

  const clickCategory = (ctg_id: string) => {
    history.push({
      state: {
        category: ctg_id,
        page: 1,
      },
    });
  };

  const clickAll = () => {
    history.push({
      state: {
        category: null,
        page: 1,
      },
    });
  };

  const clickPage = (idx: number) => {
    const category =
      location.state && location.state.category
        ? location.state.category
        : null;
    history.push({
      state: {
        category: category,
        page: idx,
      },
    });
  };

  const authContext = useContext(AuthContext);

  return (
    <div className="board-wrapper photoboard-wrapper">
      <BoardName
        board_id={boardInfo.board_id}
        board_name={boardInfo.board_name}
      />
      <div className="board-desc">{boardInfo.board_desc}</div>
      <Category
        categories={boardInfo.categories}
        selected={category}
        clickAll={clickAll}
        clickCategory={clickCategory}
      />
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
      {!data ? (
        <Loading />
      ) : (
        <>
          <div className="enif-divider"></div>
          <AlbumList board_id={boardInfo.board_id} albums={data.albumInfo} />
          {isCreating && (
            <CreateAlbum
              board_id={boardInfo.board_id}
              categories={boardInfo.categories}
              onCreate={() => {
                setIsCreating(false);
                refresh();
              }}
              onCancel={() => {
                setIsCreating(false);
              }}
            />
          )}
          {data.albumCount > 0 && (
            <Paginator
              pageIdx={pageIdx}
              pageNum={Math.ceil(data.albumCount / ALBUMROWNUM)}
              clickPage={clickPage}
            />
          )}
        </>
      )}
    </div>
  );
}

export default Memory;
