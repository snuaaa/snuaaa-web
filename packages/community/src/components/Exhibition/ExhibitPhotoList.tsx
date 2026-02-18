import { Link } from '@tanstack/react-router';
import Image from '~/components/Common/AaaImage';
import { ExhibitPhoto } from '~/services/types';

function ExhibitPhotoList({
  exhibitPhotos,
}: {
  exhibitPhotos: ExhibitPhoto[];
}) {
  const makePhotoList = () => {
    if (exhibitPhotos && exhibitPhotos.length > 0) {
      return exhibitPhotos.map((content) => {
        const exhibitPhoto = content.exhibitPhoto;
        return (
          <div className="photo-wrapper" key={content.content_id}>
            <Link
              to="."
              search={(prev) => ({
                ...prev,
                exhibitPhoto: content.content_id,
              })}
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
