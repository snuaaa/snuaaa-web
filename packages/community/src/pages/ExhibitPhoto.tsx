import { useState, useEffect, createRef, useCallback } from 'react';
import { useLocation, useHistory, useParams } from 'react-router';
import ExhibitPhotoService from 'services/ExhibitPhotoService';
import FullScreenPortal from 'containers/FullScreenPortal';
import { RecordOf, Record } from 'immutable';

import useBlockBackgroundScroll from 'hooks/useBlockBackgroundScroll';
import { ExhibitPhoto } from 'services/types';
import ExhibitPhotoComponent from 'components/Exhibition/ExhibitPhoto/ExhibitPhotoComponent';
import { useFetch } from 'hooks/useFetch';
import Loading from 'components/Common/Loading';

type LocationState = {
  backgroundLocation: string;
};

function ExhibitPhotoPage() {
  const location = useLocation<LocationState>();
  const history = useHistory();
  const { exhibitPhoto_id } = useParams<{ exhibitPhoto_id: string }>();
  const fullscreenRef = createRef<HTMLDivElement>();

  const [exhibitPhotosInfo, setExhibitPhotosInfo] = useState<ExhibitPhoto[]>(
    [],
  );
  const [contentInfo, setContentInfo] = useState<RecordOf<ExhibitPhoto>>();
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useBlockBackgroundScroll();

  const fetchFunction = useCallback(() => {
    const exhibitPhotoId = Number(exhibitPhoto_id);

    return ExhibitPhotoService.retrieveExhibitPhoto(exhibitPhotoId);
  }, [exhibitPhoto_id]);

  const { data, refresh } = useFetch({
    fetch: fetchFunction,
  });

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
    document.onfullscreenchange = function (e) {
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
          history.replace({
            pathname: `/exhibitPhoto/${exhibitPhotosInfo[index + 1].content_id}`,
            state: {
              exhibitPhotoModal: true,
              backgroundLocation: location.state.backgroundLocation,
            },
          });
        }
      } else if (direction === -1) {
        if (index < exhibitPhotosInfo.length && index > 0) {
          history.replace({
            pathname: `/exhibitPhoto/${exhibitPhotosInfo[index - 1].content_id}`,
            state: {
              exhibitPhotoModal: true,
              backgroundLocation: location.state.backgroundLocation,
            },
          });
        }
      }
    }
  };

  const closePhoto = () => {
    if (history.action === 'POP' && !history.location.state) {
      history.push('/');
    } else {
      history.goBack();
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
        await ExhibitPhotoService.deleteExhibitPhoto(Number(exhibitPhoto_id));

        const backLink = contentInfo?.parent
          ? `/exhibition/${contentInfo.parent.content_id}`
          : '/board/brd41';
        history.replace(backLink);
      } catch (err) {
        console.error(err);
        alert('삭제 실패');
      }
    }
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
