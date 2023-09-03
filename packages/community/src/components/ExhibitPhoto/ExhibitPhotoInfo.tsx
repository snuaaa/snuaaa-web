import React from 'react';
import { breakLine } from '../../utils/breakLine';
import { convertDate, convertFullDate } from '../../utils/convertDate';
import defaultProfile from 'assets/img/common/profile.png';
import ActionDrawer from '../Common/ActionDrawer';
import Image from '../Common/AaaImage';
import 'react-datepicker/dist/react-datepicker.css';
import ExhibitPhotoType from '../../types/ExhibitPhotoType';

type ExhibitPhotoInfoProps = {
    photoInfo: ExhibitPhotoType;
    my_id: number;
    setEditState: () => void;
    deletePhoto: () => void;
}

function ExhibitPhotoInfo({ photoInfo, my_id, setEditState, deletePhoto }: ExhibitPhotoInfoProps) {

  const content = photoInfo;
  const photo = photoInfo.exhibitPhoto;
  const userInfo = photoInfo && photoInfo.user;
  const photographerInfo = photoInfo && photoInfo.exhibitPhoto.photographer;

  return (
    <>
      {
        photoInfo && photo &&
                <>
                  <div className="photo-contents-wrapper">
                    {
                      userInfo && (my_id === userInfo.user_id) &&
                            <ActionDrawer
                              clickEdit={setEditState}
                              clickDelete={deletePhoto} />
                    }
                    <div className="info-wrapper">
                      <div className="info-title-date">
                        <h4>{content.title}</h4>
                      </div>
                      <div className="info-basic enif-flex-horizontal">
                        <div className="enif-flex-horizontal">
                          <i className="ri-icons ri-eye-fill"></i>
                          <p className="">{content.view_num}</p>
                          {
                            userInfo &&
                                        <>
                                          <i className="ri-icons ri-pencil-fill"></i>
                                          <p className="">{userInfo.nickname}</p>
                                        </>
                          }
                        </div>
                        <div className="enif-flex-horizontal">
                          <i className="ri-icons ri-time-line"></i>
                          <p className="">{convertFullDate(content.createdAt)}</p>
                        </div>
                      </div>
                      <div className="info-text-infos-wrapper">
                        {
                          photo && (photo.date || photo.location || photo.photographer || photo.photographer_alt
                                        || photo.camera || photo.lens || photo.focal_length
                                        || photo.focal_length || photo.exposure_time || photo.iso)
                                    &&
                                    <>
                                      <div className="enif-divider"></div>
                                      <div className="info-infos-wrapper">
                                        {
                                          (photographerInfo || photo.photographer_alt) &&
                                                <div className="photo-info-unit">
                                                  <div className="photo-info-label">Photographer</div>
                                                  {photographerInfo
                                                    ?
                                                    <>
                                                      <Image className="photo-info-profile" imgSrc={photographerInfo.profile_path} defaultImgSrc={defaultProfile} />
                                                      <div>{photographerInfo.nickname}</div>
                                                    </>
                                                    :
                                                    <div>{photo.photographer_alt}</div>
                                                  }
                                                </div>
                                        }
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
                    {
                      content.text &&
                            <>
                              <div className="enif-divider"></div>
                              <div className="info-text-wrapper">
                                <p>{breakLine(content.text)}</p>
                              </div>
                            </>
                    }
                  </div>
                </>
      }
    </>
  );
}

export default ExhibitPhotoInfo;