import { FC, useCallback } from 'react';
import { useHistory, useParams } from 'react-router';
import FullScreenPortal from '~/router/FullScreenPortal';

import PhotoDetailModal from '~/components/Photo/DetailModal';

const PhotoPage: FC = () => {
  const { photo_id: photoId } = useParams<{ photo_id: string }>();

  const history = useHistory();

  const handleMovePhoto = useCallback(
    (photoId: number) => {
      history.replace({
        pathname: `/photo/${photoId}`,
        state: history.location.state,
      });
    },
    [history],
  );

  const hanldeClosePhoto = useCallback(() => {
    if (history.action === 'POP' && !history.location.state) {
      history.push('/');
    } else {
      history.goBack();
    }
  }, [history]);

  return (
    <FullScreenPortal>
      <PhotoDetailModal
        photoId={Number(photoId)}
        onClose={hanldeClosePhoto}
        onMovePhoto={handleMovePhoto}
      />
    </FullScreenPortal>
  );
};

export default PhotoPage;
