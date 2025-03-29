import React, { ChangeEvent } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CreatePhotoRequest } from '~/services/PhotoService';

type Props = {
  photoInfo: Omit<CreatePhotoRequest, 'img_url' | 'thumbnail_url'>;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleDate: (date: Date) => void;
};

function PhotoInfoForm({ photoInfo, handleChange, handleDate }: Props) {
  return (
    <div className="photo-input-area-wrapper">
      <input
        className="input-title"
        type="text"
        name="title"
        placeholder="제목"
        onChange={handleChange}
        value={photoInfo.title}
      />
      <textarea
        className="input-desc"
        placeholder="설명"
        name="text"
        onChange={handleChange}
        value={photoInfo.text}
      />
      {photoInfo && (
        <div className="photo-infos">
          <div className="photo-info">
            <div className="label-wrapper">
              <label>Date</label>
            </div>
            <DatePicker
              selected={photoInfo.date}
              onChange={handleDate}
              dateFormat="yyyy/MM/dd"
            />
          </div>
          <div className="photo-info">
            <div className="label-wrapper">
              <label>Location</label>
            </div>
            <input
              className="w-1/2"
              type="text"
              name="location"
              onChange={(e) => handleChange(e)}
              value={photoInfo.location}
            ></input>
          </div>
          <div className="photo-info">
            <div className="label-wrapper">
              <label>Camera</label>
            </div>
            <input
              className="w-1/2"
              type="text"
              name="camera"
              onChange={(e) => handleChange(e)}
              value={photoInfo.camera}
            ></input>
          </div>
          <div className="photo-info">
            <div className="label-wrapper">
              <label>Lens</label>
            </div>
            <div>
              <input
                type="text"
                name="lens"
                onChange={(e) => handleChange(e)}
                value={photoInfo.lens}
              ></input>
              <div className="flex flex-row items-center">
                <label>@</label>
                <input
                  className="w-1/2"
                  type="text"
                  name="focal_length"
                  onChange={(e) => handleChange(e)}
                  value={photoInfo.focal_length}
                ></input>
                mm
              </div>
            </div>
          </div>
          <div className="photo-info">
            <div className="label-wrapper">Exposure</div>
            <div className="input-wrapper">
              <div>
                <label>F/</label>
                <input
                  className="w-1/4"
                  type="text"
                  name="f_stop"
                  onChange={(e) => handleChange(e)}
                  value={photoInfo.f_stop}
                ></input>
              </div>
              <div>
                <label>time</label>
                <input
                  className="w-1/4"
                  type="text"
                  name="exposure_time"
                  onChange={(e) => handleChange(e)}
                  value={photoInfo.exposure_time}
                ></input>
              </div>
              <div>
                <label>ISO</label>
                <input
                  className="w-1/4"
                  type="text"
                  name="iso"
                  onChange={(e) => handleChange(e)}
                  value={photoInfo.iso}
                ></input>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoInfoForm;
