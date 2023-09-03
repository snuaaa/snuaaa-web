import React, { useState, useEffect } from 'react';
import { Location } from 'history';

import CreateAlbum from '../Album/CreateAlbum';
import AlbumList from '../../components/PhotoBoard/AlbumList';
import Category from '../../components/Common/Category';
import Loading from '../../components/Common/Loading';
import Paginator from '../../components/Common/Paginator';
import history from '../../common/history';
import PhotoBoardService from '../../services/PhotoBoardService';
import ContentType from '../../types/ContentType';
import BoardType from '../../types/BoardType';
import BoardName from '../../components/Board/BoardName';
import AuthContext from '../../contexts/AuthContext';
import AlbumType from '../../types/AlbumType';
import { useHistory, useLocation } from 'react-router';

const TAG = 'MEMORY';
const ALBUMROWNUM = 12;

type MemoryProps = {
    boardInfo: BoardType;
}

type LocationState = {
    page: number,
    category: string
}


function Memory({ boardInfo }: MemoryProps) {

  // let albums: AlbumType[] = [];
  // let albumCount: number = 0;

  const [popUpState, setPopUpState] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [albums, setAlbums] = useState<AlbumType[]>([]);
  const [albumCount, setAlbumCount] = useState<number>(0);
  const history = useHistory();
  const location = useLocation<LocationState>();

  useEffect(() => {
    fetch();
  }, [location]);

  const fetch = async () => {

    const pageIdx = location.state && location.state.page ? location.state.page : 1;
    const category = (location.state && location.state.category) ? location.state.category : undefined;

    setIsReady(false);
    await PhotoBoardService.retrieveAlbumsInPhotoBoard(boardInfo.board_id, pageIdx, category)
      .then((res: any) => {
        setAlbums(res.data.albumInfo);
        setAlbumCount(res.data.albumCount);
        setIsReady(true);
      })
      .catch((err: Error) => {
        console.error(`[${TAG}] Retrieve Photos Fail >> ${err}`);
      });
  };

  const clickCategory = (ctg_id: string) => {
    history.push({
      state: {
        category: ctg_id,
        page: 1
      }
    });
  };

  const clickAll = () => {
    history.push({
      state: {
        category: null,
        page: 1
      }
    });
  };

  const togglePopUp = () => {
    setPopUpState(!popUpState);
  };

  const clickPage = (idx: number) => {

    const category = (location.state && location.state.category) ? location.state.category : null;
    history.push({
      state: {
        category: category,
        page: idx
      }
    });
  };

  const pageIdx = location.state && location.state.page ? location.state.page : 1;
  const category = (location.state && location.state.category) ? location.state.category : undefined;

  return (
    <AuthContext.Consumer>
      {
        authContext => (
          <div className="board-wrapper photoboard-wrapper">

            <BoardName board_id={boardInfo.board_id} board_name={boardInfo.board_name} />
            <div className="board-desc">
              {boardInfo.board_desc}
            </div>
            <Category categories={boardInfo.categories} selected={category} clickAll={clickAll} clickCategory={clickCategory} />
            <div className="board-search-wrapper">
              <div className="board-search-input">
                <i className="ri-search-line enif-f-1x"></i>
                <input type="text" />
              </div>
              <div>
                {
                  authContext.authInfo.user.grade <= boardInfo.lv_write &&
                                    <button className="board-btn-write" onClick={() => togglePopUp()}>
                                      <i className="ri-gallery-line enif-f-1p2x"></i>앨범 생성
                                    </button>
                }
              </div>
            </div>

            {(() => {
              if (isReady) {
                return (
                  <>
                    <div className="enif-divider"></div>
                    <AlbumList
                      board_id={boardInfo.board_id}
                      albums={albums} />
                    {
                      popUpState &&
                                            <CreateAlbum
                                              board_id={boardInfo.board_id}
                                              categories={boardInfo.categories}
                                              fetch={fetch}
                                              togglePopUp={togglePopUp} />
                    }
                    {
                      albumCount > 0 &&
                                            <Paginator
                                              pageIdx={pageIdx}
                                              pageNum={Math.ceil(albumCount / ALBUMROWNUM)}
                                              clickPage={clickPage} />
                    }
                  </>);
              }
              else {
                return <Loading />;
              }
            })()}
          </div>
        )
      }
    </AuthContext.Consumer>
  );
}


export default Memory;
