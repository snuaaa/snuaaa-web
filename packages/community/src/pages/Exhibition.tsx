import { FC, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import Loading from '~/components/Common/Loading';
import CreateExhibitPhoto from '~/components/Exhibition/CreateExhibitPhoto';
import ExhibitionInfo from '~/components/Exhibition/ExhibitionInfo';
import ExhibitPhotoList from '~/components/Exhibition/ExhibitPhotoList';
import { useExhibition } from '~/hooks/queries/useExhibitionQueries';
import { useAuth } from '~/contexts/auth';
import { useQueryClient } from '@tanstack/react-query';
import { exhibitionKeys } from '~/hooks/queries/useExhibitionQueries';

const ExhibitionPage: FC = () => {
  const { exhibition_id } = useParams({ from: '/exhibition/$exhibition_id' });
  const exhibitionId = Number(exhibition_id);
  const queryClient = useQueryClient();

  const { data } = useExhibition(exhibitionId);

  const authContext = useAuth();

  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePhoto = () => {
    queryClient.invalidateQueries({
      queryKey: exhibitionKeys.detail(exhibitionId),
    });
    setIsCreating(false);
  };

  if (!data) {
    return <Loading />;
  }

  const exhibitionInfo = data.exhibition.exhibitionInfo;
  const exhibitPhotos = data.exhibitPhotos.exhibitPhotosInfo;

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
                exhibition_id={exhibitionId}
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
