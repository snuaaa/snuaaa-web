import React, { ChangeEvent } from 'react';
import DatePicker from 'react-datepicker';
import ContentType from '../../types/ContentType';
import { RecordOf } from 'immutable';
import 'react-datepicker/dist/react-datepicker.css';
import CrtPhotoType from '../../types/CrtPhotoType';


type CreatePhotoInfoProps = {
    photoInfo: CrtPhotoType;
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDate: (date: Date) => void
}

function CreatePhotoInfo(
  { photoInfo, handleChange, handleDate }: CreatePhotoInfoProps) {

  return (
    <div className="photo-input-area-wrapper">
      <input className="input-title" type="text" name="title" placeholder="제목" onChange={handleChange} value={photoInfo.title} />
      <textarea className="input-desc" placeholder="설명" name="text" onChange={handleChange} value={photoInfo.text} />
      {
        photoInfo &&
                <div className="photo-infos">
                  <div className="photo-info">
                    <div className="label-wrapper"><label>Date</label></div>
                    <DatePicker selected={photoInfo.date} onChange={handleDate} dateFormat="yyyy/MM/dd" />
                  </div>
                  <div className="photo-info">
                    <div className="label-wrapper"><label>Location</label></div>
                    <input className="enif-wid-half" type="text" name="location" onChange={(e) => handleChange(e)} value={photoInfo.location}></input>
                  </div>
                  <div className="photo-info">
                    <div className="label-wrapper"><label>Camera</label></div>
                    <input className="enif-wid-half" type="text" name="camera" onChange={(e) => handleChange(e)} value={photoInfo.camera}></input>
                  </div>
                  <div className="photo-info">
                    <div className="label-wrapper"><label>Lens</label></div>
                    <div>
                      <input type="text" name="lens" onChange={(e) => handleChange(e)} value={photoInfo.lens}></input>
                      <div className="enif-flex-horizontal">
                        <label>@</label>
                        <input className="enif-wid-half" type="text" name="focal_length" onChange={(e) => handleChange(e)} value={photoInfo.focal_length}></input>mm
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
      }
    </div >
  );
}

export default CreatePhotoInfo;