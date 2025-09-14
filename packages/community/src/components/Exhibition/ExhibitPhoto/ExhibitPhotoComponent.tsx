import { Ref, useState } from 'react';

import Image from '~/components/Common/AaaImage';

import ExhibitPhotoInfo from '../ExhibitPhoto/ExhibitPhotoInfo';
import EditExhibitPhotoInfo from './EditExhibitPhotoInfo';
import { ExhibitPhoto } from '~/services/types';

type ExhibitPhotoComponentProps = {
  contentInfo: ExhibitPhoto;
  fullscreenRef: Ref<HTMLDivElement>;
  clickFullscreen: () => void;
  moveToPrev: () => void;
  moveToNext: () => void;
  deletePhoto: () => void;
  isFullscreen: boolean;
  onUpdate: () => void;
  close: () => void;
};

function ExhibitPhotoComponent({
  contentInfo,
  isFullscreen,
  fullscreenRef,
  clickFullscreen,
  moveToPrev,
  moveToNext,
  deletePhoto,
  onUpdate,
  close,
}: ExhibitPhotoComponentProps) {
  const exhibitionInfo =
    contentInfo &&
    contentInfo.exhibitPhoto &&
    contentInfo.parent &&
    contentInfo.parent.exhibition;
  const exhibitPhotoInfo = contentInfo;
  const fullscreenClass = isFullscreen
    ? 'ri-fullscreen-exit-fill'
    : 'ri-fullscreen-fill';

  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <div className="enif-popup photo-popup" onClick={close}>
        <div
          className="photo-section-wrapper"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="photo-alb-title-wrp">
            <div className="photo-alb-title">
              <h5>{exhibitionInfo ? exhibitionInfo.slogan : 'slogan'}</h5>&nbsp;
              <i className="ri-image-2-line"></i>
              {exhibitPhotoInfo.exhibitPhoto.order}
            </div>
            <div className="enif-modal-close" onClick={close}>
              <i className="ri-close-fill text-2xl cursor-pointer"></i>
            </div>
          </div>
          <div className="photo-section-bottom">
            <div className="photo-section-left">
              <div className="photo-img-wrapper" ref={fullscreenRef}>
                <div className="photo-move-action prev" onClick={moveToPrev}>
                  <i className="ri-arrow-left-s-line ri-icons cursor-pointer"></i>
                </div>
                <Image imgSrc={contentInfo.exhibitPhoto.file_path} />
                <div className="photo-move-action next" onClick={moveToNext}>
                  <i className="ri-arrow-right-s-line ri-icons cursor-pointer"></i>
                </div>
                <div className="photo-action-fullscreen-wrapper">
                  <i
                    className={`${fullscreenClass} cursor-pointer enif-f-1p2x`}
                    onClick={clickFullscreen}
                  ></i>
                </div>
              </div>
            </div>
            <div className="photo-section-right overflow-auto">
              {isEditing ? (
                <EditExhibitPhotoInfo
                  exhibitPhotoInfo={contentInfo}
                  onUpdate={() => {
                    onUpdate();
                    setIsEditing(false);
                  }}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <ExhibitPhotoInfo
                  photoInfo={contentInfo}
                  onClickEdit={() => setIsEditing(true)}
                  deletePhoto={deletePhoto}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ExhibitPhotoComponent;
