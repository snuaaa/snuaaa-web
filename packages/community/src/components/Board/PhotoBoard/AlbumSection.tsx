import CreateAlbum from '~/components/Album/modals/CreateAlbum';
import Loading from '~/components/Common/Loading';
import AlbumList from '~/components/Album/AlbumList';
import { useFetch } from '~/hooks/useFetch';
import { FC, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PhotoBoardService from '~/services/PhotoBoardService';
import { Board } from '~/services/types';
import { useAuth } from '~/contexts/auth';
import { Divider } from '~/ui';
import Pagination from '~/components/Common/Pagination';
import useQueryString from '~/hooks/useQueryString';

type Props = {
  boardInfo: Board;
};

const PAGE_SIZE = 12;

export const AlbumSection: FC<Props> = ({ boardInfo }) => {
  const authContext = useAuth();

  const [isCreating, setIsCreating] = useState(false);

  // const history = useHistory();
  const location = useLocation();
  const queryString = useQueryString();

  const page = Number(queryString.get('page') ?? 1);

  const fetchFunction = useCallback(() => {
    return PhotoBoardService.retrieveAlbumsInPhotoBoard(
      boardInfo.board_id,
      page,
    );
  }, [boardInfo.board_id, page]);

  const { data, refresh } = useFetch({ fetch: fetchFunction });

  if (!data) {
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
              <i className="ri-gallery-line enif-f-1p2x"></i>앨범 생성
            </button>
          )}
        </div>
      </div>
      <Divider />
      <AlbumList board_id={boardInfo.board_id} albums={data.albumInfo ?? []} />
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
      {data.albumCount > 0 && (
        <Pagination
          currentPage={page}
          totalPageCount={Math.ceil(data.albumCount / PAGE_SIZE)}
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
