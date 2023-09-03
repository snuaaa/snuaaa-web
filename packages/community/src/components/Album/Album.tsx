import React from 'react';
import { Redirect, match } from 'react-router';
import ContentStateEnum from '../../common/ContentStateEnum';
import Loading from '../../components/Common/Loading';
import PhotoList from '../../components/Album/PhotoList';
import AlbumInfo from '../../components/Album/AlbumInfo';
import EditAlbum from '../../components/Album/EditAlbum';
import CreatePhoto from '../../components/Photo/CreatePhoto';
import BoardName from '../../components/Board/BoardName';
import AlbumService from '../../services/AlbumService';
import history from '../../common/history';
import ContentType from '../../types/ContentType';
import CategoryType from '../../types/CategoryType';
import TagType from '../../types/TagType';
import AuthContext from '../../contexts/AuthContext';
import AlbumType from '../../types/AlbumType';
import PhotoType from '../../types/PhotoType';

const TAG = 'ALBUM';

type AlbumProps = {
    match: match<{ album_id: string }>;
    location: Location;
    // my_id: number;
}

type AlbumState = {
    albumState: number;
    popUpState: boolean;
}

class Album extends React.Component<AlbumProps, AlbumState> {

  photos: PhotoType[];
  albumInfo?: AlbumType;
  categoryInfo?: CategoryType[];
  tagInfo?: TagType[];

  constructor(props: AlbumProps) {
    super(props);
    console.log(`[${TAG}] Constructor`);
    this.photos = [];
    this.albumInfo = undefined;
    this.categoryInfo = undefined;
    this.tagInfo = undefined;
    this.state = {
      albumState: ContentStateEnum.LOADING,
      popUpState: false
    };
  }

  componentDidMount() {
    this.fetch();
  }

  componentDidUpdate(prevProps: AlbumProps) {
    if (prevProps.location !== this.props.location) {
      this.fetch();
    }
  }

  fetch = async () => {
    const album_id = Number(this.props.match.params.album_id);
    await Promise.all([
      AlbumService.retrieveAlbum(album_id),
      AlbumService.retrievePhotosInAlbum(album_id)
    ])
      .then((infos) => {
        this.albumInfo = infos[0].data.albumInfo;
        this.categoryInfo = infos[0].data.categoryInfo;
        this.tagInfo = infos[0].data.tagInfo;
        this.photos = infos[1].data;
        this.setState({
          albumState: ContentStateEnum.READY
        });
      })
      .catch((err) => {
        console.error(err);
        if (err.response && err.response.data && err.response.data.code === 4001) {
          alert('권한이 없습니다.');
          history.goBack();
        }
        else {
          this.setAlbumState(ContentStateEnum.ERROR);
          alert('해당 게시물이 존재하지 않습니다.');
          history.goBack();
        }
      });
  };

  deleteAlbum = async () => {

    const album_id = Number(this.props.match.params.album_id);
    const goDrop = window.confirm('정말로 삭제하시겠습니까? 삭제한 게시글은 다시 복원할 수 없습니다.');
    if (goDrop) {
      await AlbumService.deleteAlbum(album_id)
        .then(() => {
          this.setAlbumState(ContentStateEnum.DELETED);
        })
        .catch((err: Error) => {
          console.error(err);
          alert('삭제 실패');
        });
    }
  };

  setAlbumState = (state: number) => {
    this.setState({
      albumState: state
    });
  };

  togglePopUp = () => {
    this.setState({
      popUpState: !this.state.popUpState
    });
  };

  render() {
    const { albumState, popUpState } = this.state;
    // const { my_id } = this.props;

    return (
      <AuthContext.Consumer>
        {
          authContext => (() => {
            if (albumState === ContentStateEnum.LOADING) {
              return <Loading />;
            }
            else if ((albumState === ContentStateEnum.READY || albumState === ContentStateEnum.EDITTING) && this.albumInfo && this.albumInfo.album) {
              return (
                <>
                  <BoardName
                    board_id={this.albumInfo.board.board_id}
                    board_name={this.albumInfo.board.board_name}
                  />
                  <div className="album-wrapper">
                    <AlbumInfo
                      albumInfo={this.albumInfo}
                      my_id={authContext.authInfo.user.user_id}
                      setAlbumState={this.setAlbumState}
                      deleteAlbum={this.deleteAlbum} />
                    {
                      (!this.albumInfo.album.is_private || authContext.authInfo.user.user_id === this.albumInfo.user.user_id) &&
                                            <button className="board-btn-write" onClick={this.togglePopUp}>
                                              <i className="ri-image-line enif-f-1p2x"></i>사진 업로드
                                            </button>

                    }
                    <div className="enif-divider"></div>
                    <PhotoList photos={this.photos} />
                    {
                      popUpState &&
                                            <CreatePhoto
                                              album_id={this.albumInfo.content_id}
                                              board_id={this.albumInfo.board_id}
                                              tags={this.tagInfo}
                                              fetch={this.fetch}
                                              togglePopUp={this.togglePopUp}
                                              setReadyState={() => this.setAlbumState(ContentStateEnum.READY)} />
                    }
                    {
                      (albumState === ContentStateEnum.EDITTING) &&
                                            <EditAlbum
                                              // album_id={this.albumInfo.content_id}
                                              albumInfo={this.albumInfo}
                                              categoryInfo={this.categoryInfo}
                                              fetch={this.fetch}
                                              setAlbumState={this.setAlbumState} />
                    }
                  </div>
                  {/* <Route path="/album/:album_id/photo/:photo_id" component={Photo} /> */}
                </>
              );
            }
            else if (albumState === ContentStateEnum.DELETED && this.albumInfo) {
              return (
                <Redirect to={`/board/${this.albumInfo.board_id}`} />
              );
            }
            else {
              return <Loading />;
            }
          })()
        }
      </AuthContext.Consumer>
    );
  }
}

export default Album;
