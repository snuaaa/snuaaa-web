import {
  ChangeEvent,
  FC,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import { useHistory, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { Record } from 'immutable';

import Comment from '../Comment/Comment';
import FullScreenPortal from '../../containers/FullScreenPortal';

import Loading from '../../components/Common/Loading';
import PhotoInfo from '../../components/Photo/PhotoInfo';
import Image from '../../components/Common/AaaImage';
import EditPhotoInfo from '../../components/Photo/EditPhotoInfo';

import ContentService from '../../services/ContentService';
import AlbumService from '../../services/AlbumService';
import PhotoService from '../../services/PhotoService';
import AuthContext from '../../contexts/AuthContext';

import { Photo } from 'services/types';
import { useFetch } from 'hooks/useFetch';
import useBlockBackgroundScroll from 'hooks/useBlockBackgroundScroll';

const VISIBLE_TIME = 3;

const PhotoPage: FC = () => {
  const { photo_id: photoId } = useParams<{ photo_id: string }>();

  const history = useHistory();

  const authContext = useContext(AuthContext);

  const fetchFunction = useCallback(
    () => PhotoService.retrievePhoto(Number(photoId)),
    [photoId],
  );

  const { data, refresh } = useFetch({ fetch: fetchFunction });

  const [isFullScreen, setIsFullScreen] = useState(false);

  const [remainedTime, setRemainedTime] = useState(VISIBLE_TIME);

  const fullscreenRef = useRef<HTMLDivElement>(null);

  const timer = useRef<number>();

  useBlockBackgroundScroll();

  useEffect(() => {
    document.addEventListener('fullscreenchange', toggleFullScreen);
    return () => {
      document.removeEventListener('fullscreenchange', toggleFullScreen);
    };
  });

  useEffect(() => {
    timer.current = window.setInterval(() => {
      setRemainedTime((prevRemainedTime) => {
        if (prevRemainedTime > 0) {
          return prevRemainedTime - 1;
        }
        return prevRemainedTime;
      });
    }, 1000);

    return () => window.clearInterval(timer.current);
  });

  const [contentInfo, setContentInfo] = useState<Record<Photo>>();
  const [editContentInfo, setEditContentInfo] = useState<Record<Photo>>();
  const [isLiked, setIsLiked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (data) {
      setContentInfo(Record(data.data.photoInfo));
      setEditContentInfo(Record(data.data.photoInfo));
      setIsLiked(data.data.likeInfo);
    }
  }, [data]);

  const setAlbumThumbnail = useCallback(async () => {
    const albumInfo = contentInfo && contentInfo.get('parent');

    const data = {
      tn_photo_id: Number(photoId),
    };

    if (!albumInfo || !albumInfo.content_id) {
      alert('섬네일로 설정할 수 없습니다.');
    } else {
      try {
        await AlbumService.updateAlbumThumbnail(albumInfo.content_id, data);
      } catch (err) {
        console.error(err);
        alert('섬네일 설정 실패');
      }
    }
  }, [contentInfo, photoId]);

  const moveToAlbum = useCallback(
    (direction: 1 | -1) => {
      const prevAlbumPhoto = data?.data.prevAlbumPhoto;
      const nextAlbumPhoto = data?.data.nextAlbumPhoto;
      if (direction === 1 && prevAlbumPhoto) {
        history.replace({
          pathname: `/photo/${prevAlbumPhoto.content_id}`,
          state: {
            modal: true,
            // backgroundLocation: location.state.backgroundLocation
          },
        });
      } else if (direction === -1 && nextAlbumPhoto) {
        history.replace({
          pathname: `/photo/${nextAlbumPhoto.content_id}`,
          state: {
            modal: true,
            // backgroundLocation: location.state.backgroundLocation
          },
        });
      } else {
        console.error('Cannot Move');
      }
    },
    [data?.data.nextAlbumPhoto, data?.data.prevAlbumPhoto, history],
  );

  const moveToPhoto = useCallback(
    (direction: number) => {
      const prevPhoto = data?.data.prevPhoto;
      const nextPhoto = data?.data.nextPhoto;

      if (direction === 1 && prevPhoto) {
        history.replace({
          pathname: `/photo/${prevPhoto.content_id}`,
          state: history.location.state,
        });
      } else if (direction === -1 && nextPhoto) {
        history.replace({
          pathname: `/photo/${nextPhoto.content_id}`,
          state: history.location.state,
        });
      } else {
        console.error('Cannot Move');
      }
    },
    [data?.data.nextPhoto, data?.data.prevPhoto, history],
  );

  const closePhoto = useCallback(() => {
    if (history.action === 'POP' && !history.location.state) {
      history.push('/');
    } else {
      history.goBack();
    }
  }, [history]);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen((prevState) => !prevState);
  }, []);

  const clickFullScreen = useCallback(() => {
    const elem = fullscreenRef.current;

    if (isFullScreen && document.fullscreenElement && document.exitFullscreen) {
      // can use exitFullscreen
      document.exitFullscreen();
    } else if (elem && elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  }, [isFullScreen]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!editContentInfo) {
        return;
      }
      const name: string = e.target.name;

      if (name === 'title' || name === 'text') {
        setEditContentInfo(editContentInfo.set(name, e.target.value));
      } else {
        setEditContentInfo(
          editContentInfo.setIn(['photo', name], e.target.value),
        );
      }
    },
    [editContentInfo],
  );

  const handleDate = useCallback(
    (date: Date) => {
      if (!editContentInfo) {
        return;
      }

      setEditContentInfo(editContentInfo.setIn(['photo', 'date'], date));
    },
    [editContentInfo],
  );

  const handleTag = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!editContentInfo || !data) {
        return;
      }
      const tagId: string = e.target.id.replace('crt_', '');
      const tags = editContentInfo.get('tags');
      if (tags) {
        const isSelectedTag = tags.some((tag) => tag.tag_id === tagId);

        if (isSelectedTag) {
          setEditContentInfo(
            editContentInfo.set(
              'tags',
              tags.filter((tag) => tagId !== tag.tag_id),
            ),
          );
        } else {
          setEditContentInfo(
            editContentInfo.set(
              'tags',
              tags.concat(
                data.data.boardTagInfo.filter((tag) => tagId === tag.tag_id),
              ),
            ),
          );
        }
      }
    },
    [data, editContentInfo],
  );

  const likePhoto = useCallback(async () => {
    try {
      await ContentService.likeContent(Number(photoId));
      if (contentInfo) {
        if (isLiked) {
          setContentInfo(
            contentInfo.set('like_num', contentInfo.get('like_num') - 1),
          );
          setIsLiked(false);
        } else {
          setContentInfo(
            contentInfo.set('like_num', contentInfo.get('like_num') + 1),
          );
          setIsLiked(true);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [contentInfo, isLiked, photoId]);

  const updatePhoto = useCallback(async () => {
    if (editContentInfo) {
      try {
        await PhotoService.updatePhoto(
          Number(photoId),
          editContentInfo.toJSON(),
        );
        refresh();
      } catch (err) {
        console.error(err);
        alert('업데이트 실패');
      }
    }
  }, [editContentInfo, photoId, refresh]);

  const parentAlbum = contentInfo?.get('parent');

  const backLink = useMemo(
    () =>
      parentAlbum
        ? `/album/${parentAlbum.content_id}`
        : `/board/${contentInfo?.get('board_id')}`,
    [contentInfo, parentAlbum],
  );

  const deletePhoto = useCallback(async () => {
    if (!contentInfo) {
      return;
    }

    const goDrop = window.confirm(
      '정말로 삭제하시겠습니까? 삭제한 게시글은 다시 복원할 수 없습니다.',
    );
    if (goDrop) {
      try {
        await PhotoService.deletePhoto(Number(photoId));

        history.replace(backLink);
      } catch (err) {
        console.error(err);
        alert('삭제 실패');
      }
    }
  }, [backLink, contentInfo, history, photoId]);

  const mouseOver = useCallback(() => {
    setRemainedTime(VISIBLE_TIME);
  }, []);

  const fullscreenClass = isFullScreen
    ? 'ri-fullscreen-exit-fill'
    : 'ri-fullscreen-fill';
  const photoInfo = contentInfo && contentInfo.get('photo');

  return (
    <FullScreenPortal>
      {!(contentInfo && editContentInfo && photoInfo) ? (
        <Loading />
      ) : (
        <>
          <div className="enif-popup photo-popup" onClick={closePhoto}>
            <div
              className="photo-section-wrapper"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="photo-alb-title-wrp">
                <i
                  className="ri-arrow-left-s-line enif-pointer"
                  onClick={() => moveToAlbum(-1)}
                ></i>
                <Link className="photo-alb-title" to={backLink}>
                  <i className="ri-gallery-line"></i>
                  <h5>{parentAlbum ? parentAlbum.title : '기본앨범'}</h5>
                </Link>
                <i
                  className="ri-arrow-right-s-line enif-pointer"
                  onClick={() => moveToAlbum(1)}
                ></i>
                <div className="enif-modal-close" onClick={closePhoto}>
                  <i className="ri-close-fill enif-f-1p5x enif-pointer"></i>
                </div>
              </div>
              <div className="photo-section-bottom">
                <div className="photo-section-left">
                  <div
                    className="photo-img-wrapper"
                    ref={fullscreenRef}
                    onMouseMove={mouseOver}
                  >
                    {remainedTime > 0 && (
                      <div className="photo-move-action prev">
                        <button
                          className="photo-move-btn"
                          onClick={() => moveToPhoto(-1)}
                        >
                          <i className="ri-arrow-left-s-line ri-icons enif-pointer"></i>
                        </button>
                      </div>
                    )}
                    <Image imgSrc={photoInfo.file_path} />
                    {remainedTime > 0 && (
                      <div className="photo-move-action next">
                        <button
                          className="photo-move-btn enif-flex-center"
                          onClick={() => moveToPhoto(1)}
                        >
                          <i className="ri-arrow-right-s-line ri-icons enif-pointer"></i>
                        </button>
                      </div>
                    )}
                    <div className="photo-action-fullscreen-wrapper enif-flex-center">
                      <i
                        className={`${fullscreenClass} enif-pointer enif-f-1p2x`}
                        onClick={clickFullScreen}
                      ></i>
                    </div>
                  </div>
                </div>
                <div className="photo-section-right">
                  {isEditing ? (
                    <EditPhotoInfo
                      photoInfo={editContentInfo}
                      boardTagInfo={data?.data.boardTagInfo ?? []}
                      onCancel={() => setIsEditing(false)}
                      updatePhoto={updatePhoto}
                      handleChange={handleChange}
                      handleDate={handleDate}
                      handleTag={handleTag}
                    />
                  ) : (
                    <>
                      <PhotoInfo
                        photoInfo={contentInfo.toJSON()}
                        likeInfo={isLiked}
                        my_id={authContext.authInfo.user.user_id}
                        onClickEdit={() => setIsEditing(true)}
                        likePhoto={likePhoto}
                        deletePhoto={deletePhoto}
                        setAlbumThumbnail={setAlbumThumbnail}
                      />
                      <Comment parent_id={Number(photoId)} />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </FullScreenPortal>
  );
};

export default PhotoPage;
