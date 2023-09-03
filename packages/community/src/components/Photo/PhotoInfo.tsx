import React from 'react';
import ProfileMini from '../Common/ProfileMini';
import ContentStateEnum from '../../common/ContentStateEnum';

import { breakLine } from '../../utils/breakLine';
import { convertDate, convertFullDate } from '../../utils/convertDate';
import ActionDrawer from '../Common/ActionDrawer';
import ContentType from '../../types/ContentType';
import 'react-datepicker/dist/react-datepicker.css';
import PhotoType from '../../types/PhotoType';
import ExhibitPhotoType from '../../types/ExhibitPhotoType';

type PhotoInfoProps = {
    photoInfo: PhotoType | ExhibitPhotoType;
    likeInfo: boolean;
    my_id: number;
    setPhotoState: (state: number) => void;
    deletePhoto: () => void;
    likePhoto: () => void;
    setAlbumThumbnail: () => void;
}

const PhotoInfo = ({ photoInfo, likeInfo, my_id, setPhotoState, deletePhoto,
  likePhoto, setAlbumThumbnail }: PhotoInfoProps) => {

  const content = photoInfo;
  let photo;
  if ((photoInfo as PhotoType).photo) {
    photo = (photoInfo as PhotoType).photo;
  }
  else if ((photoInfo as ExhibitPhotoType).exhibitPhoto) {
    photo = (photoInfo as ExhibitPhotoType).exhibitPhoto;
  }
  const userInfo = photoInfo && photoInfo.user;
  const tagInfo = photoInfo && photoInfo.tags;

  const makeTagList = () => {
    if (tagInfo) {
      return tagInfo.map((tag) => {
        const tagClassName = (tag.tag_type === 'M') ? 'tag-type-1' : 'tag-type-2';
        return (
          <div key={tag.tag_id} className={`tag-unit ${tagClassName}`}># {tag.tag_name}</div>
        );
      });
    }
  };

  return (
    <>
      {
        photoInfo && photo &&
                <>
                  <div className="photo-contents-wrapper">
                    {
                      userInfo && (my_id === userInfo.user_id) &&
                            <ActionDrawer
                              clickEdit={() => setPhotoState(ContentStateEnum.EDITTING)}
                              clickDelete={deletePhoto}
                              isPhoto={true}
                              clickSetThumbnail={setAlbumThumbnail} />
                    }

                    <div className="info-wrapper">
                      <div className="info-title-date">
                        <h4>{content.title}</h4>
                        <p className="info-date">{convertFullDate(content.createdAt)}</p>
                      </div>
                      <div className="info-tags">{makeTagList()}</div>
                      <div className="info-text-infos-wrapper">
                        {
                          content.text &&
                                    <>
                                      <div className="enif-divider"></div>
                                      <div className="info-text-wrapper">
                                        <p>{breakLine(content.text)}</p>
                                      </div>
                                    </>
                        }

                        {
                          photo && (photo.date || photo.location
                                        || photo.camera || photo.lens || photo.focal_length
                                        || photo.focal_length || photo.exposure_time || photo.iso)
                                    &&
                                    <>
                                      <div className="enif-divider"></div>
                                      <div className="info-infos-wrapper">
                                        {photo.date && (
                                          <div className="photo-info-unit">
                                            <div className="photo-info-label">Date</div>
                                            <div>{convertDate(photo.date)}</div>
                                          </div>)}

                                        {photo.location && (
                                          <div className="photo-info-unit">
                                            <div className="photo-info-label">Location</div>
                                            <div>{photo.location}</div>
                                          </div>)}

                                        {photo.camera && (
                                          <div className="photo-info-unit">
                                            <div className="photo-info-label">Camera</div>
                                            <div>{photo.camera}</div>
                                          </div>)}

                                        {photo.lens && (
                                          <div className="photo-info-unit">
                                            <div className="photo-info-label">Lens</div>
                                            <div>{photo.lens}</div>
                                            {photo.focal_length && (
                                              <>
                                                <div className="photo-info-fl">@</div>
                                                <div>{photo.focal_length}mm</div>
                                              </>)}
                                          </div>)}


                                        {(photo.f_stop || photo.exposure_time || photo.iso) && (
                                          <div className="photo-info-unit">
                                            <div className="photo-info-label">Setting</div>
                                            <div>
                                              {photo.f_stop && <>F/{photo.f_stop}</>}
                                              {photo.exposure_time && <> {photo.exposure_time}</>}
                                              {photo.iso && <> ISO{photo.iso}</>}
                                            </div>
                                          </div>)}
                                      </div>
                                    </>
                        }
                      </div>
                    </div>
                    <div className="enif-divider"></div>
                    <ProfileMini userInfo={userInfo} />
                    <div className="enif-divider"></div>
                  </div>
                  <div className="actions-wrapper">
                    <div className="nums-wrapper">
                      <div className="view-num-wrapper">
                        <i className="ri-eye-fill"></i>
                        {content.view_num}
                      </div>
                      <div className="like-num-wrapper">
                        <i className={`${likeInfo ? 'ri-heart-fill' : 'ri-heart-line'} enif-f-1p5x enif-pointer`} onClick={() => likePhoto()}>
                        </i>
                        {content.like_num}
                      </div>
                      <div className="comment-num-wrapper">
                        <i className="ri-message-2-fill enif-f-1p5x"></i>
                        {content.comment_num}
                      </div>
                    </div>
                  </div>
                </>
      }
    </>
  );
};

export default PhotoInfo;