import React, { ChangeEvent } from 'react';
import ContentStateEnum from '../../common/ContentStateEnum';

import ReactDatePicker from 'react-datepicker';
import ContentType from '../../types/ContentType';
import 'react-datepicker/dist/react-datepicker.css';
import TagType from '../../types/TagType';
import { Prompt } from 'react-router';
import PhotoType from '../../types/PhotoType';

type PhotoInfoProps = {
    photoInfo: PhotoType;
    boardTagInfo: TagType[];
    setPhotoState: (state: number) => void;
    updatePhoto: () => void;
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDate: (date: Date) => void
    handleTag: (e: ChangeEvent<HTMLInputElement>) => void;
}

const EditPhotoInfo = ({ photoInfo, boardTagInfo, setPhotoState, updatePhoto,
  handleChange, handleDate, handleTag }: PhotoInfoProps) => {

  const content = photoInfo;
  const photo = photoInfo && photoInfo.photo;
  const tagInfo = photoInfo && photoInfo.tags;

  const makeEditTagList = () => {
    if (boardTagInfo && boardTagInfo.length > 0) {
      return (
        <div className="tag-list-wrapper">
          {boardTagInfo.map((tag) => {
            const labelClassName = (tag.tag_type === 'M') ? 'tag-label-1' : 'tag-label-2';
            const selectedTags = tagInfo ? tagInfo.map(tag => tag.tag_id) : [];
            return (
              <div className="tag-unit" key={tag.tag_id} >
                <input
                  type="checkbox"
                  id={'crt_' + tag.tag_id}
                  checked={selectedTags ? selectedTags.includes(tag.tag_id) : false}
                  onChange={handleTag} />
                <label className={labelClassName} htmlFor={'crt_' + tag.tag_id}># {tag.tag_name}</label>
              </div>
            );
          })}
        </div>
      );
    }
  };

  return (
    <>
      {
        content && photo &&
                <>
                  <Prompt when={true} message="작성 중인 내용은 저장되지 않습니다. 작성을 취소하시겠습니까?"></Prompt>
                  <div className="photo-input-area-wrapper">
                    {makeEditTagList()}
                    <input className="input-title" type="text" name="title" placeholder="제목" onChange={handleChange} value={content.title} />
                    <textarea className="input-desc" placeholder="설명" name="text" onChange={handleChange} value={content.text} />

                    <div className="photo-infos">
                      <div className="photo-info">
                        <div className="label-wrapper"><label>Date</label></div>
                        <ReactDatePicker selected={photo.date && new Date(String(photo.date))} onChange={handleDate} dateFormat="yyyy/MM/dd" />
                      </div>
                      <div className="photo-info">
                        <div className="label-wrapper"><label>Location</label></div>
                        <input className="enif-wid-half" type="text" name="location" onChange={(e) => handleChange(e)} value={photo.location}></input>
                      </div>
                      <div className="photo-info">
                        <div className="label-wrapper"><label>Camera</label></div>
                        <input className="enif-wid-half" type="text" name="camera" onChange={(e) => handleChange(e)} value={photo.camera}></input>
                      </div>
                      <div className="photo-info">
                        <div className="label-wrapper"><label>Lens</label></div>
                        <div>
                          <input type="text" name="lens" onChange={(e) => handleChange(e)} value={photo.lens}></input>
                          <div className="enif-flex-horizontal">
                            <div><label>@</label></div>
                            <input className="enif-wid-half" type="text" name="focal_length" onChange={(e) => handleChange(e)} value={photo.focal_length}></input>mm
                          </div>
                        </div>
                      </div>
                      <div className="photo-info">
                        <div className="label-wrapper">Exposure</div>
                        <div className="input-wrapper">
                          <div>
                            <label>F/</label>
                            <input className="enif-wid-quater" type="text" name="f_stop" onChange={(e) => handleChange(e)} value={photo.f_stop}></input>
                          </div>
                          <div>
                            <label>time</label>
                            <input className="enif-wid-quater" type="text" name="exposure_time" onChange={(e) => handleChange(e)} value={photo.exposure_time}></input>
                          </div>
                          <div>
                            <label>ISO</label>
                            <input className="enif-wid-quater" type="text" name="iso" onChange={(e) => handleChange(e)} value={photo.iso}></input>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div >
                  <div className="crt-photo-btn-wrapper">
                    <button className="btn-cancel" onClick={() => setPhotoState(ContentStateEnum.READY)}>취소</button>
                    <button className="btn-ok" onClick={updatePhoto}>수정완료</button>
                  </div>
                </>
      }
    </>
  );
};

export default EditPhotoInfo;
