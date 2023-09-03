import React from 'react';
import { Redirect, match } from 'react-router';
import ExhibitionService from '../../services/ExhibitionService';
import ContentStateEnum from '../../common/ContentStateEnum';
import Loading from '../Common/Loading';
import CreateExhibitPhoto from './CreateExhibitPhoto';
import ExhibitionInfo from '../ExhibitBoard/ExhibitionInfo';
import ExhibitPhotoList from '../ExhibitBoard/ExhibitPhotoList';
import AuthContext from '../../contexts/AuthContext';
import ExhibitionType from '../../types/ExhibitionType';
import ExhibitPhotoType from '../../types/ExhibitPhotoType';

const TAG = 'EXHIBITION';

type ExhibitionProps = {
    match: match<{ exhibition_id: string }>;
}

type ExhibitionState = {
    exhibitionState: number;
    popUpState: boolean;
}

class Exhibition extends React.Component<ExhibitionProps, ExhibitionState> {

  exhibitionInfo?: ExhibitionType;
  exhibitPhotos: ExhibitPhotoType[];

  constructor(props: ExhibitionProps) {
    super(props);
    console.log(`[${TAG}] Constructor`);
    // this.photos = [];
    this.exhibitionInfo = undefined;
    this.exhibitPhotos = [];
    this.state = {
      // exhibition_id: this.props.match.params.exhibition_id,
      exhibitionState: ContentStateEnum.LOADING,
      popUpState: false
    };
  }

  componentDidMount() {
    this.fetch();
  }

  fetch = async () => {
    const exhibition_id = Number(this.props.match.params.exhibition_id);
    await Promise.all([
      ExhibitionService.retrieveExhibition(exhibition_id),
      ExhibitionService.retrieveExhibitPhotosinExhibition(exhibition_id)
    ])
      .then((infos) => {
        this.exhibitionInfo = infos[0].data.exhibitionInfo;
        this.exhibitPhotos = infos[1].data.exhibitPhotosInfo;
        this.setState({
          exhibitionState: ContentStateEnum.READY
        });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  deleteAlbum = async () => {
    const exhibition_id = Number(this.props.match.params.exhibition_id);

    const goDrop = window.confirm('정말로 삭제하시겠습니까? 삭제한 게시글은 다시 복원할 수 없습니다.');
    if (goDrop) {
      await ExhibitionService.deleteExhibition(exhibition_id)
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
      exhibitionState: state
    });
  };

  togglePopUp = () => {
    this.setState({
      popUpState: !this.state.popUpState
    });
  };

  render() {
    const { exhibitionInfo, exhibitPhotos } = this;
    const { exhibitionState, popUpState } = this.state;
    const exhibition_id = Number(this.props.match.params.exhibition_id);

    return (
      <>
        {
          (() => {
            if (exhibitionState === ContentStateEnum.LOADING) {
              return <Loading />;
            }
            else if ((exhibitionState === ContentStateEnum.READY || exhibitionState === ContentStateEnum.EDITTING)) {
              return (
                <AuthContext.Consumer>
                  {authContext => (
                    <>
                      {
                        exhibitionInfo && exhibitionInfo.exhibition &&
                                                <>
                                                  <ExhibitionInfo exhibition_no={exhibitionInfo.exhibition.exhibition_no} slogan={exhibitionInfo.exhibition.slogan} />
                                                  {
                                                    (authContext.authInfo.user.grade <= exhibitionInfo.board.lv_write) &&
                                                        <button className="board-btn-write" onClick={this.togglePopUp}>
                                                          <i className="ri-image-line enif-f-1p2x"></i>사진 업로드
                                                        </button>
                                                  }
                                                  <div className="exhibition-wrapper">
                                                    <ExhibitPhotoList exhibitPhotos={exhibitPhotos} />
                                                    {
                                                      popUpState &&
                                                            <CreateExhibitPhoto
                                                              board_id={exhibitionInfo.board_id}
                                                              exhibition_id={exhibition_id}
                                                              exhibition_no={exhibitionInfo.exhibition.exhibition_no}
                                                              fetch={this.fetch}
                                                              togglePopUp={this.togglePopUp} />
                                                    }
                                                  </div>
                                                </>
                      }
                    </>
                  )}
                </AuthContext.Consumer>
              );
            }
            else if (exhibitionInfo && exhibitionState === ContentStateEnum.DELETED) {
              return (
                <Redirect to={`/board/${exhibitionInfo.board_id}`} />
              );
            }
            else {
              return <Loading />;
            }
          })()
        }
      </>
    );
  }
}

export default Exhibition;
