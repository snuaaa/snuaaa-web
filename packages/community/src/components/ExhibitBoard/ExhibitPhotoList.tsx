import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import Image from '../../components/Common/AaaImage';
import ExhibitPhotoType from '../../types/ExhibitPhotoType';

function ExhibitPhotoList({ exhibitPhotos }: { exhibitPhotos: ExhibitPhotoType[] }) {

  const history = useHistory();
  const makePhotoList = () => {
    if (exhibitPhotos && exhibitPhotos.length > 0) {
      return exhibitPhotos.map(content => {
        const exhibitPhoto = content.exhibitPhoto;
        return (
          <div className="photo-wrapper" key={content.content_id}>
            <Link to={{
              pathname: `/exhibitPhoto/${content.content_id}`,
              state: {
                exhibitPhotoModal: true,
                backgroundLocation: history.location
              }
            }} >
              <Image imgSrc={exhibitPhoto.thumbnail_path} />
            </Link>
          </div>
        );
      });
    }
  };

  return (
    <>
      <div className="photo-list-wrapper">
        {makePhotoList()}
      </div>
    </>
  );
}

export default ExhibitPhotoList;