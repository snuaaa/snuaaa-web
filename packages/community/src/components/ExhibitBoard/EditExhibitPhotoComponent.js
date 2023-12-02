import React from 'react';
import Image from 'components/Common/AaaImage.tsx';
import ContentsStateEnum from 'common/ContentStateEnum';
import CreateExhibitPhotoInfo from './CreateExhibitPhotoInfo';

const EditExhibitPhotoComponent = ({ photoInfo, photographer, handleChange, handleDate,
  handlePhotographer, selectPhotographer, removePhotographer, setPhotoState, updatePhoto, searchUsers }) => {

  return (
    <div className="crt-photo-popup">
      <div className="crt-photo-wrp edt-photo-wrp">
        <div className="crt-photo-header">
          <h3>사진 수정</h3>
        </div>
        <div className="crt-photo-body">
          <div className="crt-photo-center">
            <Image imgSrc={photoInfo.file_path} />
          </div>
          <div className="crt-photo-right">
            <CreateExhibitPhotoInfo
              title={photoInfo.title}
              text={photoInfo.text}
              order={photoInfo.order}
              photographer={photographer}
              photographer_alt={photoInfo.photographer_alt}
              date={photoInfo.date}
              location={photoInfo.location}
              camera={photoInfo.camera}
              lens={photoInfo.lens}
              focal_length={photoInfo.focal_length}
              f_stop={photoInfo.f_stop}
              exposure_time={photoInfo.exposure_time}
              iso={photoInfo.iso}
              searchUsers={searchUsers}
              handleChange={handleChange}
              handleDate={handleDate}
              handlePhotographer={handlePhotographer}
              selectPhotographer={selectPhotographer}
              removePhotographer={removePhotographer} />

            <div className="crt-photo-btn-wrapper">
              <button className="btn-cancel" onClick={() => setPhotoState(ContentsStateEnum.READY)}>취소</button>
              <button className="btn-ok" onClick={updatePhoto}>완료</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditExhibitPhotoComponent;