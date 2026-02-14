import { Link, useRouter } from '@tanstack/react-router';
import Image from '~/components/Common/AaaImage';
import { ExhibitPhoto } from '~/services/types';

function ExhibitPhotoList({
  exhibitPhotos,
}: {
  exhibitPhotos: ExhibitPhoto[];
}) {
  const router = useRouter();
  const makePhotoList = () => {
    if (exhibitPhotos && exhibitPhotos.length > 0) {
      return exhibitPhotos.map((content) => {
        const exhibitPhoto = content.exhibitPhoto;
        return (
          <div className="photo-wrapper" key={content.content_id}>
            <Link
              to="/exhibitPhoto/$exhibitPhoto_id"
              params={{ exhibitPhoto_id: String(content.content_id) }}
              state={{
                exhibitPhotoModal: true,
                backgroundLocation: router.state.location,
              }}
            >
              <Image imgSrc={exhibitPhoto.thumbnail_path} />
            </Link>
          </div>
        );
      });
    }
  };

  return (
    <>
      <div className="photo-list-wrapper">{makePhotoList()}</div>
    </>
  );
}

export default ExhibitPhotoList;
