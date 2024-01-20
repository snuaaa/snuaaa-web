import React from 'react';
// import { Link } from 'react-router-dom';
import ContentStateEnum from '../../common/ContentStateEnum';
import { breakLine } from '../../utils/breakLine';
import ActionDrawer from '../Common/ActionDrawer';
import history from '../../common/history';
import AlbumType from '../../types/AlbumType';

type AlbumInfoProps = {
    albumInfo: AlbumType;
    my_id: number;
    setAlbumState: (state: number) => void;
    deleteAlbum: () => void;
}

function AlbumInfo({ albumInfo, my_id, setAlbumState, deleteAlbum }: AlbumInfoProps) {
  const content = albumInfo;
  const album = albumInfo.album;
  const user = albumInfo.user;
  return (
    <>
      {
        content && album && user &&
                <div className="album-info">
                  <div className="alb-header-wrapper">
                    <div className="alb-btn-back">
                      {/* <Link to={`/board/${content.board_id}`}> */}
                      <button onClick={() => history.goBack()}>
                        <i className="ri-arrow-left-line"></i>
                      </button>
                      {/* </Link> */}
                    </div>
                    <h5 className="alb-title">{content.title}</h5>
                    <i className={`${album.is_private ? 'ri-user-fill' : 'ri-group-fill'} color-gray1 enif-f-1x`}>
                    </i>
                    {
                      (my_id === user.user_id) &&
                            <ActionDrawer
                              clickEdit={() => setAlbumState(ContentStateEnum.EDITTING)}
                              clickDelete={deleteAlbum}
                            />
                    }
                    <p className="alb-author">{user.nickname}</p>
                  </div>
                  <div>
                    <p className="contents">{breakLine(content.text)}</p>
                  </div>
                </div>
      }
    </>
  );
}

export default AlbumInfo;