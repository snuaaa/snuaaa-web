import React, { ChangeEvent } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Image from '../Common/AaaImage';
import imgDefaultProfile from 'assets/img/common/profile.png';
import CrtExhibitPhotoType from '../../types/CrtExhibitPhotoType';
import UserType from '../../types/UserType';

type CreateExhibitPhotoInfoProps = {
    photoInfo: CrtExhibitPhotoType;
    searchUsers: UserType[]
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDate: (date: Date) => void;
    handlePhotographer: (e: ChangeEvent<HTMLInputElement>) => void;
    selectPhotographer: (index: number) => void;
    removePhotographer: () => void;
}

function CreateExhibitPhotoInfo({ photoInfo, searchUsers, handleChange, handleDate,
  selectPhotographer, removePhotographer, handlePhotographer }: CreateExhibitPhotoInfoProps) {

  const makeUserList = function (users: UserType[]) {
    if (users && users.length > 0) {
      return users.map((user, index) => {
        return (
          <div key={user.user_uuid} className="mini-user-unit" onClick={() => selectPhotographer(index)}>
            <Image className="mini-user-profile" imgSrc={user.profile_path} defaultImgSrc={imgDefaultProfile} />
            {user.nickname}
          </div>
        );
      });
    }
  };

  return (
    <div className="photo-input-area-wrapper">
      <input className="input-title" type="text" name="title" placeholder="제목" onChange={handleChange} value={photoInfo.title} />
      <textarea className="input-desc" placeholder="설명" name="text" onChange={handleChange} value={photoInfo.text} />
      <div className="photo-infos">
        <div className="photo-info">
          <div className="label-wrapper"><label>Order</label></div>
          <input type="number" name="order" onChange={handleChange} value={photoInfo.order}></input>
        </div>
        <div className="photo-info">
          <div className="label-wrapper"><label>Photographer</label></div>
          {
            photoInfo.photographer && photoInfo.photographer.user_uuid ?
              <div className="mini-user-selected enif-f-1x">
                <div>{photoInfo.photographer.nickname}</div>
                <i className="ri-close-circle-line enif-pointer" onClick={removePhotographer}></i>
              </div>
              :
              <input type="text" name="photographer" onChange={handlePhotographer} autoComplete="off" value={photoInfo.photographer_alt} />
          }
          {
            searchUsers && searchUsers.length > 0 &&
                        <div className="mini-user-list">
                          {makeUserList(searchUsers)}
                        </div>
          }
        </div>
        <div className="photo-info">
          <div className="label-wrapper"><label>Date</label></div>
          <DatePicker selected={photoInfo.date} onChange={handleDate} dateFormat="yyyy/MM/dd" />
        </div>
        <div className="photo-info">
          <div className="label-wrapper"><label>Location</label></div>
          <input type="text" name="location" onChange={(e) => handleChange(e)} value={photoInfo.location}></input>
        </div>
        <div className="photo-info">
          <div className="label-wrapper"><label>Camera</label></div>
          <input type="text" name="camera" onChange={(e) => handleChange(e)} value={photoInfo.camera}></input>
        </div>
        <div className="photo-info">
          <div className="label-wrapper"><label>Lens</label></div>
          <div>
            <input type="text" name="lens" onChange={(e) => handleChange(e)} value={photoInfo.lens} />
            <div className="enif-flex-horizontal">
              <label>@</label>
              <input className="enif-wid-half" type="number" name="focal_length" onChange={(e) => handleChange(e)} value={photoInfo.focal_length} />mm
            </div>
          </div>
        </div>
        <div className="photo-info">
          <div className="label-wrapper">Exposure</div>
          <div className="input-wrapper">
            <div>
              <label>F/</label>
              <input className="enif-wid-quater" type="text" name="f_stop" onChange={(e) => handleChange(e)} value={photoInfo.f_stop}></input>
            </div>
            <div>
              <label>time</label>
              <input className="enif-wid-quater" type="text" name="exposure_time" onChange={(e) => handleChange(e)} value={photoInfo.exposure_time}></input>
            </div>
            <div>
              <label>ISO</label>
              <input className="enif-wid-quater" type="text" name="iso" onChange={(e) => handleChange(e)} value={photoInfo.iso}></input>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}

export default CreateExhibitPhotoInfo;