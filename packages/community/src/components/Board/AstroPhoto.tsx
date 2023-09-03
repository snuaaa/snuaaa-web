import React, { ChangeEvent, useState, useEffect } from 'react';
import { Location } from 'history';

import CreatePhoto from '../Photo/CreatePhoto';
import CreateAlbum from '../Album/CreateAlbum';
import AlbumList from '../../components/PhotoBoard/AlbumList';
import PhotoList from '../../components/Album/PhotoList';
import Tag from '../../components/Common/Tag';
import Loading from '../../components/Common/Loading';
import Paginator from '../../components/Common/Paginator';
import PhotoBoardService from '../../services/PhotoBoardService';
import BoardType from '../../types/BoardType';
import ContentType from '../../types/ContentType';
import BoardName from '../../components/Board/BoardName';
import AuthContext from '../../contexts/AuthContext';
import AlbumType from '../../types/AlbumType';
import PhotoType from '../../types/PhotoType';
import { useLocation, useHistory } from 'react-router';

const TAG = 'ASTROPHOTO';
const ALBUMROWNUM = 12;

type AstroPhotoProps = {
    boardInfo: BoardType;
}

type LocationState = {
    page: number,
    isViewAlbums: boolean;
    tags: string[]
}

function AstroPhoto({ boardInfo }: AstroPhotoProps) {

  // let albums: AlbumType[] = [];
  // let photos: PhotoType[] = [];
  // let count: number = 0;

  const [albums, setAlbums] = useState<{ data: AlbumType[], count: number }>({ data: [], count: 0 });
  const [photos, setPhotos] = useState<{ data: PhotoType[], count: number }>({ data: [], count: 0 });
  const [popUpState, setPopUpState] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const history = useHistory();
  const location = useLocation<LocationState>();

  useEffect(() => {
    fetch();
  }, [location]);


  const fetch = async () => {

    const isViewAlbums = (location.state && location.state.isViewAlbums) ? true : false;
    const pageIdx = (location.state && location.state.page) ? location.state.page : 1;
    const selectedTags = (location.state && location.state.tags && location.state.tags.length > 0) ? location.state.tags : [];

    setIsReady(false);
    if (isViewAlbums) {
      await PhotoBoardService.retrieveAlbumsInPhotoBoard(boardInfo.board_id, pageIdx)
        .then((res) => {
          setAlbums({
            data: res.data.albumInfo,
            count: res.data.albumCount
          });
          // albums = res.data.albumInfo;
          // count = res.data.albumCount;
          setIsReady(true);
        })
        .catch((err: Error) => {
          console.error(err);
        });
    }
    else {
      await PhotoBoardService.retrievePhotosInPhotoBoard(boardInfo.board_id, pageIdx, selectedTags)
        .then((res) => {
          // this.tags = res[0].data;
          setPhotos({
            data: res.data.photoInfo,
            count: res.data.photoCount
          });
          setIsReady(true);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };


  const setIsViewAlbums = (isViewAlbums: boolean) => {
    history.replace({
      state: {
        isViewAlbums: isViewAlbums,
        page: 1
      }
    });
  };

  const clickTag = (e: ChangeEvent<HTMLInputElement>) => {

    const isViewAlbums = (location.state && location.state.isViewAlbums) ? true : false;
    const selectedTags = (location.state && location.state.tags && location.state.tags.length > 0) ? location.state.tags : [];

    const tagId = e.target.id;

    if (selectedTags.includes(tagId)) {
      history.replace({
        state: {
          isViewAlbums: isViewAlbums,
          page: 1,
          tags: selectedTags.filter((tag: any) => tagId !== tag)
        }
      });
    }
    else {
      history.replace({
        state: {
          isViewAlbums: isViewAlbums,
          page: 1,
          tags: selectedTags.concat(tagId)
        }
      });
    }
  };

  const clickAll = () => {

    const isViewAlbums = (location.state && location.state.isViewAlbums) ? true : false;

    history.push({
      state: {
        isViewAlbums: isViewAlbums,
        page: 1,
        tags: []
      }
    });
  };

  const togglePopUp = () => {
    setPopUpState(!popUpState);
  };

  const clickPage = (idx: number) => {
    const isViewAlbums = (location.state && location.state.isViewAlbums) ? true : false;
    const selectedTags = (location.state && location.state.tags && location.state.tags.length > 0) ? location.state.tags : [];

    history.push({
      state: {
        isViewAlbums: isViewAlbums,
        page: idx,
        tags: selectedTags
      }
    });
  };



  const isViewAlbums = (location.state && location.state.isViewAlbums) ? true : false;
  const pageIdx = (location.state && location.state.page) ? location.state.page : 1;
  const selectedTags = (location.state && location.state.tags && location.state.tags.length > 0) ? location.state.tags : [];

  const albumSelectorClassName = 'view-type-selector' + (isViewAlbums ? '' : ' selected');
  const photoSelectorClassName = 'view-type-selector' + (isViewAlbums ? ' selected' : '');
  const count = isViewAlbums ? albums.count : photos.count;

  return (
    <AuthContext.Consumer>
      {
        authContext => (
          <div className="board-wrapper photoboard-wrapper">
            <BoardName board_id={boardInfo.board_id} board_name={boardInfo.board_name} />
            <div className="board-desc">
              {boardInfo.board_desc}
            </div>
            {!isReady && <Loading />}
            <div className="view-type-selector-wrapper">
              <div className={albumSelectorClassName} onClick={() => setIsViewAlbums(false)}>사진</div>
              <div className={photoSelectorClassName} onClick={() => setIsViewAlbums(true)}>앨범</div>
            </div>
            {
              !isViewAlbums ?
                (
                  <>
                    <div className="board-search-wrapper">
                      <div className="board-search-input">
                        <i className="ri-search-line enif-f-1x"></i>
                        <input type="text" />
                      </div>
                      <div>
                        {
                          authContext.authInfo.user.grade <= boardInfo.lv_write &&
                                                    <button className="board-btn-write" onClick={() => togglePopUp()}>
                                                      <i className="ri-image-line enif-f-1p2x"></i>사진 업로드
                                                    </button>
                        }
                      </div>
                    </div>
                    {
                      boardInfo.tags &&
                                            <>
                                              <Tag
                                                tags={boardInfo.tags}
                                                clickAll={clickAll}
                                                selectedTags={selectedTags}
                                                clickTag={clickTag} />
                                              <div className="enif-divider"></div>
                                              <PhotoList
                                                photos={photos.data} />
                                              {
                                                popUpState &&
                                                    <CreatePhoto
                                                      board_id={boardInfo.board_id}
                                                      tags={boardInfo.tags}
                                                      fetch={fetch}
                                                      togglePopUp={togglePopUp}
                                                      setReadyState={() => setIsReady(true)} />
                                              }
                                            </>
                    }
                  </>
                )
                :
                (
                  <>
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
                    <div className="enif-divider"></div>
                    <AlbumList
                      board_id={boardInfo.board_id}
                      albums={albums.data} />
                    {
                      popUpState &&
                                            <CreateAlbum
                                              board_id={boardInfo.board_id}
                                              fetch={fetch}
                                              togglePopUp={togglePopUp} />
                    }
                  </>
                )
            }
            {count > 0 && <Paginator pageIdx={pageIdx} pageNum={Math.ceil(count / ALBUMROWNUM)} clickPage={clickPage} />}
          </div>
        )
      }
    </AuthContext.Consumer>
  );
}

export default AstroPhoto;
