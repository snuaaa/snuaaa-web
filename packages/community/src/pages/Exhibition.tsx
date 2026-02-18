import { FC, useCallback, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import ExhibitionService from '~/services/ExhibitionService';
import Loading from '~/components/Common/Loading';
import CreateExhibitPhoto from '~/components/Exhibition/CreateExhibitPhoto';
import ExhibitPhotoService from '~/services/ExhibitPhotoService';
import ExhibitionInfo from '~/components/Exhibition/ExhibitionInfo';
import ExhibitPhotoList from '~/components/Exhibition/ExhibitPhotoList';
import { useFetch } from '~/hooks/useFetch';
import { useAuth } from '~/contexts/auth';

const ExhibitionPage: FC = () => {
  const { exhibition_id } = useParams({ from: '/exhibition/$exhibition_id' });

  const fetchFunction = useCallback(() => {
    const exhibitionId = Number(exhibition_id);
    return Promise.all([
      ExhibitionService.retrieveExhibition(exhibitionId),
      ExhibitPhotoService.retrieveExhibitPhotosinExhibition(exhibitionId),
    ]);
  }, [exhibition_id]);

  const { data, refresh } = useFetch({ fetch: fetchFunction });

  const authContext = useAuth();

  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePhoto = () => {
    refresh();
    setIsCreating(false);
  };

  if (!data) {
    return <Loading />;
  }

  const exhibitionInfo = data[0].exhibitionInfo;
  const exhibitPhotos = data[1].exhibitPhotosInfo;

  return (
    <>
      {exhibitionInfo && exhibitionInfo.exhibition && (
        <>
          <ExhibitionInfo
            exhibition_no={exhibitionInfo.exhibition.exhibition_no}
            slogan={exhibitionInfo.exhibition.slogan}
          />
          {authContext.authInfo.user.grade <= exhibitionInfo.board.lv_write && (
            <button
              className="board-btn-write"
              onClick={() => setIsCreating(true)}
            >
              <i className="ri-image-line enif-f-1p2x"></i>사진 업로드
            </button>
          )}
          <div className="exhibition-wrapper">
            <ExhibitPhotoList exhibitPhotos={exhibitPhotos} />
            {isCreating && (
              <CreateExhibitPhoto
                board_id={exhibitionInfo.board_id}
                exhibition_id={Number(exhibition_id)}
                exhibition_no={exhibitionInfo.exhibition.exhibition_no}
                onCreate={handleCreatePhoto}
                onCancel={() => setIsCreating(false)}
              />
            )}
          </div>
        </>
      )}
    </>
  );
};

export default ExhibitionPage;
