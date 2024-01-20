import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Image from '../Common/AaaImage';
import PhotoType from '../../types/PhotoType';

type NewPhotosProps = {
    title: string;
    board_id: string;
    photos: PhotoType[];
}

function NewPhotos({ title, board_id, photos }: NewPhotosProps) {

  const location = useLocation();
  const makePhotoList = () => {
    if (photos) {
      return photos.map(content => {
        return (
          <div className="new-photo-list" key={content.content_id}>
            <Link to={{
              pathname: `/photo/${content.content_id}`,
              state: {
                modal: true,
                backgroundLocation: location
              }
            }}>
              {
                content.photo &&
                                <Image imgSrc={content.photo.thumbnail_path} />
              }
            </Link>
          </div>
        );
      });
    }
  };

  return (
    <div className="new-photos-wrapper">
      <Link to={`/board/${board_id}`}>
        <h4>{title}</h4>
      </Link>
      <div className="new-photo-list-wrapper">
        {makePhotoList()}
      </div>
    </div>
  );
}

export default NewPhotos;
