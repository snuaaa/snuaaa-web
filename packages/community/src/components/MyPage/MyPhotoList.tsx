import React from 'react';
import { Link } from 'react-router-dom';
import Image from '../Common/AaaImage';
import history from '../../common/history';
import ContentType from '../../types/ContentType';
import defaultPhotoCover from 'assets/img/default_photo_img.png';
import PhotoType from '../../types/PhotoType';

const MyPhotoList = ({ photos }: { photos: PhotoType[] }) => {

  const makePhotoList = () => {

    if (photos && photos.length > 0) {
      return photos.map(photo => {
        const contentInfo = photo;
        const photoInfo = photo.photo;
        return (
          <div className="photo-wrapper" key={contentInfo.content_id}>
            <Link to={{
              pathname: `/photo/${contentInfo.content_id}`,
              state: {
                modal: true,
                backgroundLocation: history.location
              }
            }}>
              <div className="photo-cover">
                <i className="ri-heart-fill"></i> {contentInfo.like_num}&nbsp;
                <i className="ri-message-2-fill"></i> {contentInfo.comment_num}
              </div>
              {
                photoInfo &&
                                <Image
                                  imgSrc={photoInfo.thumbnail_path}
                                  defaultImgSrc={defaultPhotoCover}
                                  local={false} />
              }
            </Link>
          </div>
        );
      });
    }
  };

  return (
    <div className="my-list-wrapper">
      {/* <h4>등록한 사진</h4> */}
      <div className="photo-list-wrapper my-photo-list-wrapper">
        {makePhotoList()}
      </div>
    </div>
  );
};

export default MyPhotoList;