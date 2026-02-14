import { FC, useCallback } from 'react';
import { useNavigate, useRouter, useParams } from '@tanstack/react-router';
import FullScreenPortal from '~/components/Common/FullScreenPortal';

import PhotoDetailModal from '~/components/Photo/DetailModal';

const PhotoPage: FC = () => {
  const { photo_id: photoId } = useParams({ from: '/photo/$photo_id' });

  const router = useRouter();
  const navigate = useNavigate();

  const handleMovePhoto = useCallback(
    (photoId: number) => {
      navigate({
        to: `/photo/${photoId}`,
        replace: true,
        // state: router.history.location.state, // Sending state might need different approach in Tanstack Router if it's not supported directly in navigate options like this for same-route navigation with replacement.
        // But for now, assuming standard navigation. If state preservation is needed, we might need to use search params or global store.
      });
    },
    [navigate],
  );

  const hanldeClosePhoto = useCallback(() => {
    // router.history.back();
    // Fallback logic if needed
    if (window.history.length > 2) {
      router.history.back();
    } else {
      navigate({ to: '/' });
    }
  }, [router, navigate]);

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
