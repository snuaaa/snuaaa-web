import { useCallback, useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';

import { useAuth } from '~/contexts/auth';
import useBlockBackgroundScroll from '~/hooks/useBlockBackgroundScroll';
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
import { useLikeContent } from '~/hooks/queries/useContentQueries';
import { useUpdateAlbumThumbnail } from '~/hooks/queries/useAlbumQueries';

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
  const { mutateAsync: mutateLikeContent } = useLikeContent();
  const { mutateAsync: mutateUpdateAlbumThumbnail } = useUpdateAlbumThumbnail();

  const setAlbumThumbnail = useCallback(async () => {
    const albumInfo = contentInfo?.parent;

    const data = {
      tn_photo_id: Number(photoId),
    };

    if (!albumInfo || !albumInfo.content_id) {
      alert('섬네일로 설정할 수 없습니다.');
    } else {
      try {
        await mutateUpdateAlbumThumbnail({
          album_id: albumInfo.content_id,
          data,
        });
      } catch (err) {
        console.error(err);
        alert('섬네일 설정 실패');
      }
    }
  }, [contentInfo, photoId, mutateUpdateAlbumThumbnail]);

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
      await mutateLikeContent(Number(photoId));
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
  }, [contentInfo, isLiked, photoId, mutateLikeContent]);

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
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_300ms_ease]"
            onClick={onClose}
          >
            {/* Modal Container */}
            <div
              className="relative flex flex-col w-[95vw] max-w-[1400px] h-[90vh] max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_400ms_ease]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Header Bar ── */}
              <div className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-800 to-primary-700 text-white relative shrink-0">
                <button
                  className="p-1 rounded-full hover:bg-white/20 transition-colors duration-200"
                  onClick={() => moveToAlbum(-1)}
                >
                  <i className="ri-arrow-left-s-line text-xl"></i>
                </button>
                <Link
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors duration-200 text-white no-underline font-bold text-lg tracking-tight"
                  to={backLink}
                >
                  <i className="ri-gallery-line text-primary-300"></i>
                  <span>{parentAlbum ? parentAlbum.title : '기본앨범'}</span>
                </Link>
                <button
                  className="p-1 rounded-full hover:bg-white/20 transition-colors duration-200"
                  onClick={() => moveToAlbum(1)}
                >
                  <i className="ri-arrow-right-s-line text-xl"></i>
                </button>
                <button
                  className="absolute right-3 p-1.5 rounded-full hover:bg-white/20 transition-colors duration-200"
                  onClick={onClose}
                >
                  <i className="ri-close-fill text-2xl"></i>
                </button>
              </div>

              {/* ── Body: Photo + Side Panel ── */}
              <div className="flex flex-1 min-h-0 flex-col md:flex-row">
                <PhotoViewer
                  onClickPrev={() => moveToPhoto('prev')}
                  onClickNext={() => moveToPhoto('next')}
                  imgUrl={photoInfo.img_url ?? photoInfo.file_path}
                />
                <div className="grow flex flex-col basis-auto md:basis-[400px] md:min-w-[400px] bg-primary-50 overflow-auto">
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
