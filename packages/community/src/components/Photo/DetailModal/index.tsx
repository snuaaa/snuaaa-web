import { useCallback, useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';

import { useAuth } from '~/contexts/auth';
import useBlockBackgroundScroll from '~/hooks/useBlockBackgroundScroll';
import ContentService from '~/services/ContentService';
import AlbumService from '~/services/AlbumService';
import Loading from '~/components/Common/Loading';
import Comment from '~/components/Comment';
import { Photo } from '~/services/types';

import EditPhotoInfo from './EditPhotoInfo';
import PhotoInfo from './PhotoInfo';
import PhotoViewer from './PhotoViewer';
import {
  usePhotoDetail,
  useDeletePhoto,
} from '~/hooks/queries/usePhotoQueries';

type Props = {
  photoId: number;
  onClose: () => void;
  onMovePhoto: (photoId: number) => void;
};

const PhotoDetailModal = ({ photoId, onClose, onMovePhoto }: Props) => {
  const authContext = useAuth();

  const navigate = useNavigate();

  const { data } = usePhotoDetail(photoId);

  useBlockBackgroundScroll();

  const [contentInfo, setContentInfo] = useState<Photo>();
  const [isLiked, setIsLiked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (data) {
      setContentInfo(data.photoInfo);
      setIsLiked(data.likeInfo);
    }
  }, [data]);

  const { mutateAsync: mutateAsyncDeletePhoto } = useDeletePhoto(photoId);

  const setAlbumThumbnail = useCallback(async () => {
    const albumInfo = contentInfo?.parent;

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
      const prevAlbumPhoto = data?.prevAlbumPhoto;
      const nextAlbumPhoto = data?.nextAlbumPhoto;
      if (direction === 1 && prevAlbumPhoto) {
        onMovePhoto(prevAlbumPhoto.content_id);
      } else if (direction === -1 && nextAlbumPhoto) {
        onMovePhoto(nextAlbumPhoto.content_id);
      } else {
        console.error('Cannot Move');
      }
    },
    [data, onMovePhoto],
  );

  const moveToPhoto = useCallback(
    (direction: 'prev' | 'next') => {
      const prevPhoto = data?.prevPhoto;
      const nextPhoto = data?.nextPhoto;

      if (direction === 'prev' && prevPhoto) {
        onMovePhoto(prevPhoto.content_id);
      } else if (direction === 'next' && nextPhoto) {
        onMovePhoto(nextPhoto.content_id);
      } else {
        console.error('Cannot Move');
      }
    },
    [data, onMovePhoto],
  );

  const likePhoto = useCallback(async () => {
    if (!contentInfo) {
      return;
    }
    try {
      await ContentService.likeContent(Number(photoId));
      if (isLiked) {
        setContentInfo((prev) =>
          prev
            ? ({
                ...prev,
                like_num: prev.like_num - 1,
              } as Photo)
            : prev,
        );
        setIsLiked(false);
      } else {
        setContentInfo((prev) =>
          prev
            ? ({
                ...prev,
                like_num: prev.like_num + 1,
              } as Photo)
            : prev,
        );
        setIsLiked(true);
      }
    } catch (err) {
      console.error(err);
    }
  }, [contentInfo, isLiked, photoId]);

  const parentAlbum = contentInfo?.parent;

  const backLink = useMemo(
    () =>
      parentAlbum
        ? `/album/${parentAlbum.content_id}`
        : `/board/${contentInfo?.board_id}`,
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
        await mutateAsyncDeletePhoto();

        navigate({ to: backLink });
      } catch (err) {
        console.error(err);
        alert('삭제 실패');
      }
    }
  }, [backLink, contentInfo, navigate, mutateAsyncDeletePhoto]);

  const onUpdate = useCallback(() => {
    setIsEditing(false);
  }, []);

  const photoInfo = contentInfo && contentInfo.photo;

  return (
    <>
      {!(contentInfo && photoInfo) ? (
        <Loading />
      ) : (
        <>
          <div className="enif-popup photo-popup" onClick={onClose}>
            <div
              className="photo-section-wrapper"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="photo-alb-title-wrp">
                <i
                  className="ri-arrow-left-s-line cursor-pointer"
                  onClick={() => moveToAlbum(-1)}
                ></i>
                <Link className="photo-alb-title" to={backLink}>
                  <i className="ri-gallery-line"></i>
                  <h5>{parentAlbum ? parentAlbum.title : '기본앨범'}</h5>
                </Link>
                <i
                  className="ri-arrow-right-s-line cursor-pointer"
                  onClick={() => moveToAlbum(1)}
                ></i>
                <div className="enif-modal-close" onClick={onClose}>
                  <i className="ri-close-fill text-2xl cursor-pointer"></i>
                </div>
              </div>
              <div className="photo-section-bottom">
                <PhotoViewer
                  onClickPrev={() => moveToPhoto('prev')}
                  onClickNext={() => moveToPhoto('next')}
                  imgUrl={photoInfo.img_url ?? photoInfo.file_path}
                />
                <div className="grow flex flex-col basis-[400px] bg-[#FFFFFF] overflow-auto">
                  {isEditing ? (
                    <EditPhotoInfo
                      photoInfo={contentInfo}
                      boardTagInfo={data?.boardTagInfo ?? []}
                      onCancel={() => setIsEditing(false)}
                      onUpdate={onUpdate}
                    />
                  ) : (
                    <>
                      <PhotoInfo
                        photoInfo={contentInfo}
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
    </>
  );
};

export default PhotoDetailModal;
