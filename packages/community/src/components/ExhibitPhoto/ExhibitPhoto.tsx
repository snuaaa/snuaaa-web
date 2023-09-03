import React, { useState, useEffect, createRef } from 'react';
import { Redirect, match, useLocation, useRouteMatch, useHistory } from 'react-router';
import ExhibitPhotoService from '../../services/ExhibitPhotoService';
import Loading from '../Common/Loading';
import ContentStateEnum from '../../common/ContentStateEnum';
// import history from '../../common/history';
import FullScreenPortal from '../../containers/FullScreenPortal';
import Image from '../Common/AaaImage';
import ExhibitPhotoComponent from '../ExhibitBoard/ExhibitPhotoComponent';
import { Location } from 'history';
import { RecordOf, Record } from 'immutable';
import AuthContext from '../../contexts/AuthContext';
import ExhibitPhotoType from '../../types/ExhibitPhotoType';
import useBlockBackgroundScroll from '../../hooks/useBlockBackgroundScroll';

type LocationState = {
    backgroundLocation: string
}


function ExhibitPhoto() {
  const location = useLocation<LocationState>();
  const history = useHistory();
  const match = useRouteMatch<{ exhibitPhoto_id: string }>();
  const fullscreenRef = createRef<HTMLDivElement>();


  const [exhibitPhotosInfo, setexhibitPhotosInfo] = useState<ExhibitPhotoType[]>([]);
  const [contentInfo, setContentInfo] = useState<RecordOf<ExhibitPhotoType>>();
  const [photoState, setPhotoState] = useState<number>(ContentStateEnum.LOADING);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useBlockBackgroundScroll();

  useEffect(() => {
    fetch();
    document.onfullscreenchange = function (e) {
      toggleFullScreen();
    };
  }, [location]);


  const fetch = async () => {
    const exhibitPhoto_id = Number(match.params.exhibitPhoto_id);

    setPhotoState(ContentStateEnum.LOADING);
    await ExhibitPhotoService.retrieveExhibitPhoto(exhibitPhoto_id)
      .then((res) => {
        const exhibitPhotoInfo = res.data.exhibitPhotoInfo;
        setexhibitPhotosInfo(res.data.exhibitPhotosInfo);
        setContentInfo(Record(exhibitPhotoInfo)());
        setPhotoState(ContentStateEnum.READY);
        // likeInfo: res.data.likeInfo,
      })
      .catch((err) => {
        console.error(err);
        if (err.response && err.response.data && err.response.data.code === 4001) {
          alert('권한이 없습니다.');
          history.goBack();
        }
        else {
          setPhotoState(ContentStateEnum.ERROR);
        }
      });
  };

  const moveToPhoto = (direction: number) => {
    if (contentInfo && exhibitPhotosInfo && exhibitPhotosInfo.length > 0) {
      let index = -1;
      for (let i = 0; i < exhibitPhotosInfo.length; i++) {
        if (exhibitPhotosInfo[i].content_id === contentInfo.content_id) {
          index = i;
          break;
        }
      }
      if (direction === 1) {
        if (index < exhibitPhotosInfo.length - 1 && index > -1) {
          history.replace({
            pathname: `/exhibitPhoto/${exhibitPhotosInfo[index + 1].content_id}`,
            state: {
              exhibitPhotoModal: true,
              backgroundLocation: location.state.backgroundLocation
            }
          });
        }
      }
      else if (direction === -1) {
        if (index < exhibitPhotosInfo.length && index > 0) {
          history.replace({
            pathname: `/exhibitPhoto/${exhibitPhotosInfo[index - 1].content_id}`,
            state: {
              exhibitPhotoModal: true,
              backgroundLocation: location.state.backgroundLocation
            }
          });
        }
      }
    }
  };

  const closePhoto = () => {
    if (history.action === 'POP' && !history.location.state) {
      history.push('/');
    }
    else {
      history.goBack();
    }
  };

  const toggleFullScreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const clickFullscreen = () => {
    const elem = fullscreenRef.current;

    if (isFullscreen) {
      if (document.fullscreenElement) {
        // can use exitFullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }
    else {
      if (elem && elem.requestFullscreen) {
        elem.requestFullscreen();
      }
    }
  };



  const deletePhoto = async () => {
    const exhibitPhoto_id = Number(match.params.exhibitPhoto_id);

    const goDrop = window.confirm('정말로 삭제하시겠습니까? 삭제한 게시글은 다시 복원할 수 없습니다.');
    if (goDrop) {
      await ExhibitPhotoService.deleteExhibitPhoto(exhibitPhoto_id)
        .then(() => {
          setPhotoState(ContentStateEnum.DELETED);
        })
        .catch((err: Error) => {
          console.error(err);
          alert('삭제 실패');
        });
    }
  };

  return (
    <AuthContext.Consumer>
      {authContext => (
        <FullScreenPortal>
          <>
            {/* {
                            photoState === ContentStateEnum.LOADING && 
                            <Loading />
                        } */}
            {
              (() => {
                // if (photoState === ContentStateEnum.LOADING) {
                //     return <Loading />
                // }
                if (photoState === ContentStateEnum.DELETED && contentInfo) {
                  let backLink;
                  if (!contentInfo.parent) {
                    backLink = '/board/brd41';
                  }
                  else {
                    backLink = `/exhibition/${contentInfo.parent.content_id}`;
                  }
                  return (
                    <Redirect to={backLink} />
                  );
                }
                else if (contentInfo) {
                  return (
                    <>
                      <ExhibitPhotoComponent
                        contentInfo={contentInfo}
                        my_id={authContext.authInfo.user.user_id}
                        fullscreenRef={fullscreenRef}
                        clickFullscreen={clickFullscreen}
                        moveToPrev={() => moveToPhoto(-1)}
                        moveToNext={() => moveToPhoto(1)}
                        isFullscreen={isFullscreen}
                        isEditting={photoState === ContentStateEnum.EDITTING}
                        editPhoto={() => setPhotoState(ContentStateEnum.EDITTING)}
                        cancelEdit={() => setPhotoState(ContentStateEnum.READY)}
                        deletePhoto={deletePhoto}
                        fetch={fetch}
                        close={closePhoto} />
                    </>
                  );
                }
                else return (
                  <div></div>
                );
              })()
            }
          </>

        </FullScreenPortal>
      )}
    </AuthContext.Consumer>
  );
}


export default ExhibitPhoto;
