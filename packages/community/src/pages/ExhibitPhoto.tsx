import { useState, useEffect, createRef, useCallback } from 'react';
import { useRouter, useNavigate } from '@tanstack/react-router';
import FullScreenPortal from '~/components/Common/FullScreenPortal';
import { RecordOf, Record } from 'immutable';

import useBlockBackgroundScroll from '~/hooks/useBlockBackgroundScroll';
import { ExhibitPhoto } from '~/services/types';
import ExhibitPhotoComponent from '~/components/Exhibition/ExhibitPhoto/ExhibitPhotoComponent';
import Loading from '~/components/Common/Loading';
import {
  useExhibitPhoto,
  useDeleteExhibitPhoto,
  exhibitPhotoKeys,
} from '~/hooks/queries/useExhibitPhotoQueries';
import { useQueryClient } from '@tanstack/react-query';

type ExhibitPhotoPageProps = {
  exhibitPhotoId: number;
};

function ExhibitPhotoPage({ exhibitPhotoId }: ExhibitPhotoPageProps) {
  const router = useRouter();
  const navigate = useNavigate();
  const fullscreenRef = createRef<HTMLDivElement>();
  const queryClient = useQueryClient();

  const [exhibitPhotosInfo, setExhibitPhotosInfo] = useState<ExhibitPhoto[]>(
    [],
  );
  const [contentInfo, setContentInfo] = useState<RecordOf<ExhibitPhoto>>();
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useBlockBackgroundScroll();

  const { data } = useExhibitPhoto(exhibitPhotoId);
  const deletePhotoMutation = useDeleteExhibitPhoto();

  useEffect(() => {
    if (data) {
      const exhibitPhotoInfo = data.exhibitPhotoInfo;
      setExhibitPhotosInfo(data.exhibitPhotosInfo);
      setContentInfo(Record(exhibitPhotoInfo)());
    }
  }, [data]);

  const toggleFullScreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  useEffect(() => {
    document.onfullscreenchange = function () {
      toggleFullScreen();
    };
  }, [toggleFullScreen]);

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
          navigate({
            to: '.',
            search: (prev: { [key: string]: unknown }) => ({
              ...prev,
              exhibitPhoto: exhibitPhotosInfo[index + 1].content_id,
            }),
            replace: true,
          });
        }
      } else if (direction === -1) {
        if (index < exhibitPhotosInfo.length && index > 0) {
          navigate({
            to: '.',
            search: (prev: { [key: string]: unknown }) => ({
              ...prev,
              exhibitPhoto: exhibitPhotosInfo[index - 1].content_id,
            }),
            replace: true,
          });
        }
      }
    }
  };

  const closePhoto = () => {
    if (window.history.length > 2) {
      router.history.back();
    } else {
      navigate({ to: '/' });
    }
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
    } else {
      if (elem && elem.requestFullscreen) {
        elem.requestFullscreen();
      }
    }
  };

  const deletePhoto = async () => {
    const goDrop = window.confirm(
      '정말로 삭제하시겠습니까? 삭제한 게시글은 다시 복원할 수 없습니다.',
    );
    if (goDrop) {
      try {
        await deletePhotoMutation.mutateAsync(exhibitPhotoId);

        const backLink = contentInfo?.parent
          ? `/exhibition/${contentInfo.parent.content_id}`
          : '/board/brd41';
        navigate({ to: backLink as '/', replace: true });
      } catch (err) {
        console.error(err);
        alert('삭제 실패');
      }
    }
  };

  const refresh = () => {
    queryClient.invalidateQueries({
      queryKey: exhibitPhotoKeys.detail(exhibitPhotoId),
    });
  };

  if (!contentInfo) {
    return <Loading />;
  }

  return (
    <FullScreenPortal>
      <>
        <ExhibitPhotoComponent
          contentInfo={contentInfo}
          fullscreenRef={fullscreenRef}
          clickFullscreen={clickFullscreen}
          moveToPrev={() => moveToPhoto(-1)}
          moveToNext={() => moveToPhoto(1)}
          isFullscreen={isFullscreen}
          deletePhoto={deletePhoto}
          onUpdate={refresh}
          close={closePhoto}
        />
      </>
    </FullScreenPortal>
  );
}

export default ExhibitPhotoPage;
