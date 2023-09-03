import React, { Ref } from 'react';

import ActionDrawer from '../Common/ActionDrawer';
import Image from '../Common/AaaImage';
import ExhibitPhotoType from '../../types/ExhibitPhotoType';
import ExhibitPhotoInfo from '../ExhibitPhoto/ExhibitPhotoInfo';
import EditExhibitPhotoInfo from './EditExhibitPhotoInfo';

type ExhibitPhotoComponentProps = {
    contentInfo: ExhibitPhotoType;
    my_id: number;
    fullscreenRef: Ref<HTMLDivElement>;
    clickFullscreen: () => void;
    moveToPrev: () => void;
    moveToNext: () => void;
    editPhoto: () => void;
    cancelEdit: () => void;
    deletePhoto: () => void;
    isEditting: boolean;
    isFullscreen: boolean;
    fetch: () => void;
    close: () => void;
}

function ExhibitPhotoComponent({ contentInfo, my_id, isEditting, isFullscreen,
  fullscreenRef, clickFullscreen, moveToPrev, moveToNext,
  editPhoto, cancelEdit, deletePhoto, fetch, close }: ExhibitPhotoComponentProps) {

  const exhibitionInfo = contentInfo
        && contentInfo.exhibitPhoto
        && contentInfo.parent
        && contentInfo.parent.exhibition;
  const exhibitPhotoInfo = contentInfo;
  const fullscreenClass = isFullscreen ? 'ri-fullscreen-exit-fill' : 'ri-fullscreen-fill';

  return (
    <>
      <div className="enif-popup photo-popup" onClick={close}>
        <div className="photo-section-wrapper" onClick={(e) => e.stopPropagation()}>
          <div className="photo-alb-title-wrp">
            <div className="photo-alb-title">
              <h5>{exhibitionInfo ? exhibitionInfo.slogan : 'slogan'}</h5>&nbsp;
              <i className="ri-image-2-line"></i>
              {exhibitPhotoInfo.exhibitPhoto.order}
            </div>
            <div className="enif-modal-close" onClick={close}>
              <i className="ri-close-fill enif-f-1p5x enif-pointer"></i>
            </div>
          </div>
          <div className="photo-section-bottom">
            <div className="photo-section-left">
              <div className="photo-img-wrapper" ref={fullscreenRef} >
                <div className="photo-move-action prev" onClick={moveToPrev}>
                  <i className="ri-arrow-left-s-line ri-icons enif-pointer"></i>
                </div>
                <Image imgSrc={contentInfo.exhibitPhoto.file_path} />
                <div className="photo-move-action next" onClick={moveToNext}>
                  <i className="ri-arrow-right-s-line ri-icons enif-pointer"></i>
                </div>
                <div className="photo-action-fullscreen-wrapper">
                  <i className={`${fullscreenClass} enif-pointer enif-f-1p2x`} onClick={clickFullscreen}></i>
                </div>
              </div>
            </div>
            <div className="photo-section-right">
              {
                isEditting ?
                  <EditExhibitPhotoInfo
                    exhibitPhotoInfo={contentInfo}
                    fetch={fetch}
                    cancel={cancelEdit}
                  />
                  :
                  <ExhibitPhotoInfo
                    photoInfo={contentInfo}
                    my_id={my_id}
                    setEditState={editPhoto}
                    deletePhoto={deletePhoto}
                  />
              }
              {/* <div className="photo-contents-wrapper">
                                {
                                    userInfo && (my_id === userInfo.user_id) &&
                                    <ActionDrawer
                                        clickEdit={editPhoto}
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
                                        <div className="enif-divider"></div>
                                        <div className="info-infos-wrapper">
                                            {
                                                (photographerInfo || exhibitPhotoInfo.photographer_alt) &&
                                                <div className="photo-info-unit">
                                                    <div className="photo-info-label">Photographer</div>
                                                    {photographerInfo
                                                        ?
                                                        <>
                                                            <Image className="photo-info-profile" imgSrc={photographerInfo.profile_path} defaultImgSrc={defaultProfile} />
                                                            <div>{photographerInfo.nickname}</div>
                                                        </>
                                                        :
                                                        <div>{exhibitPhotoInfo.photographer_alt}</div>
                                                    }
                                                </div>
                                            }
                                            {exhibitPhotoInfo.date && (
                                                <div className="photo-info-unit">
                                                    <div className="photo-info-label">Date</div>
                                                    <div>{convertDate(exhibitPhotoInfo.date)}</div>
                                                </div>
                                            )}
                                            {exhibitPhotoInfo.location && (
                                                <div className="photo-info-unit">
                                                    <div className="photo-info-label">Location</div>
                                                    <div>{exhibitPhotoInfo.location}</div>
                                                </div>)}

                                            {exhibitPhotoInfo.camera && (
                                                <div className="photo-info-unit">
                                                    <div className="photo-info-label">Camera</div>
                                                    <div>{exhibitPhotoInfo.camera}</div>
                                                </div>)}

                                            {exhibitPhotoInfo.lens && (
                                                <div className="photo-info-unit">
                                                    <div className="photo-info-label">Lens</div>
                                                    <div>{exhibitPhotoInfo.lens}</div>
                                                    {exhibitPhotoInfo.focal_length && (
                                                        <>
                                                            <div className="photo-info-fl">@</div>
                                                            <div>{exhibitPhotoInfo.focal_length}mm</div>
                                                        </>)}
                                                </div>)}


                                            {(exhibitPhotoInfo.f_stop || exhibitPhotoInfo.exposure_time || exhibitPhotoInfo.iso) && (
                                                <div className="photo-info-unit">
                                                    <div className="photo-info-label">Setting</div>
                                                    <div>
                                                        {exhibitPhotoInfo.f_stop && <>F/{exhibitPhotoInfo.f_stop}</>}
                                                        {exhibitPhotoInfo.exposure_time && <> {exhibitPhotoInfo.exposure_time}</>}
                                                        {exhibitPhotoInfo.iso && <> ISO{exhibitPhotoInfo.iso}</>}
                                                    </div>
                                                </div>)}
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
                                </div>
                            </div> */}
            </div>

          </div>
        </div>
      </div>

    </>
  );
}

export default ExhibitPhotoComponent;