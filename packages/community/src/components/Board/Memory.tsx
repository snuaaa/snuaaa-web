import { useState, useCallback } from 'react';

import CreateAlbum from '../Album/modals/CreateAlbum';
import AlbumList from '../../components/Album/AlbumList';
import AlbumCategorySelector from '~/components/Common/AlbumCategorySelector';
import Loading from '../../components/Common/Loading';
import PhotoBoardService from '../../services/PhotoBoardService';

import BoardName from '../../components/Board/BoardName';

import { useNavigate, useSearch } from '@tanstack/react-router';

import { Board } from '~/services/types';
import { useFetch } from '~/hooks/useFetch';
import { useAuth } from '~/contexts/auth';
import { Divider } from '~/ui';
import Pagination from '../Common/Pagination';

type MemoryProps = {
  boardInfo: Board;
};

const PAGE_SIZE = 12;

function Memory({ boardInfo }: MemoryProps) {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const navigate = useNavigate({ from: '/board/$board_id' });

  const searchParams = useSearch({ from: '/board/$board_id' });

  const page = Number(searchParams.page ?? 1);
  const category = searchParams.category || '';

  const fetchFunction = useCallback(() => {
    return PhotoBoardService.retrieveAlbumsInPhotoBoard(
      boardInfo.board_id,
      page,
      category,
    );
  }, [boardInfo.board_id, category, page]);

  const { data, refresh } = useFetch({ fetch: fetchFunction });

  const clickCategory = (ctg_id: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: 1,
        category: ctg_id,
      }),
    });
  };

  const clickAll = () => {
    navigate({
      search: (prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { category: _category, ...rest } = prev;
        return { ...rest, page: 1 };
      },
    });
  };

  const authContext = useAuth();

  return (
    <div className="board-wrapper photoboard-wrapper">
      <BoardName
        board_id={boardInfo.board_id}
        board_name={boardInfo.board_name}
      />
      <div className="board-desc">{boardInfo.board_desc}</div>
      <AlbumCategorySelector
        categories={boardInfo.categories}
        selected={category}
        onClickAll={clickAll}
        onClickCategory={clickCategory}
      />
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
              <i className="ri-gallery-line enif-f-1p2x"></i>앨범 생성
            </button>
          )}
        </div>
      </div>
      {!data ? (
        <Loading />
      ) : (
        <>
          <Divider />
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
            <Pagination
              currentPage={page}
              totalPageCount={Math.ceil(data.albumCount / PAGE_SIZE)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default Memory;
