import React, { ChangeEvent, useState } from 'react';
import ContentStateEnum from '../../common/ContentStateEnum';

import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Prompt } from 'react-router';
import ExhibitPhotoType from '../../types/ExhibitPhotoType';
import CreateExhibitPhotoInfo from './CreateExhibitPhotoInfo';
import CrtExhibitPhotoType from '../../types/CrtExhibitPhotoType';
import UserType from '../../types/UserType';
import UserService from '../../services/UserService';
import ExhibitPhotoService from '../../services/ExhibitPhotoService';

type EditExhibitPhotoInfoProps = {
    exhibitPhotoInfo: ExhibitPhotoType;
    fetch: () => void;
    cancel: () => void;
}

function EditExhibitPhotoInfo({ exhibitPhotoInfo, fetch, cancel }: EditExhibitPhotoInfoProps) {

  const [searchUsers, setSearchUsers] = useState<UserType[]>([]);
  const [edittingContentInfo, setEdittingContentInfo] = useState<CrtExhibitPhotoType>({
    title: exhibitPhotoInfo.title,
    text: exhibitPhotoInfo.text,
    order: exhibitPhotoInfo.exhibitPhoto.order,
    photographer: exhibitPhotoInfo.exhibitPhoto.photographer,
    photographer_alt: exhibitPhotoInfo.exhibitPhoto.photographer_alt,
    date: exhibitPhotoInfo.exhibitPhoto.date ? new Date(exhibitPhotoInfo.exhibitPhoto.date) : undefined,
    location: exhibitPhotoInfo.exhibitPhoto.location,
    camera: exhibitPhotoInfo.exhibitPhoto.camera,
    lens: exhibitPhotoInfo.exhibitPhoto.lens,
    focal_length: exhibitPhotoInfo.exhibitPhoto.focal_length,
    f_stop: exhibitPhotoInfo.exhibitPhoto.f_stop,
    exposure_time: exhibitPhotoInfo.exhibitPhoto.exposure_time,
    iso: exhibitPhotoInfo.exhibitPhoto.iso,
  });

  const submit = async () => {
    await ExhibitPhotoService.updateExhibitPhoto(exhibitPhotoInfo.content_id, edittingContentInfo)
      .then(() => {
        fetch();
      })
      .catch((err: Error) => {
        console.error(err);
        alert('업데이트 실패');
      });
  };


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name: string = e.target.name;
    setEdittingContentInfo(
      {
        ...edittingContentInfo,
        [name]: e.target.value
      });
  };

  const handleDate = (date: Date) => {
    setEdittingContentInfo(
      {
        ...edittingContentInfo,
        'date': date
      });
  };

  const handlePhotographer = (e: ChangeEvent<HTMLInputElement>) => {
    setEdittingContentInfo(
      {
        ...edittingContentInfo,
        photographer_alt: e.target.value
      });
    if (e.target.value) {
      fetchUsers(e.target.value);
    }
  };


  const fetchUsers = async (name: string) => {
    UserService.searchMini(name)
      .then((res: any) => {
        setSearchUsers(res.data.userList);
      })
      .catch((err: Error) => {
        console.error(err);
      });
  };

  const selectPhotographer = (index: number) => {
    setEdittingContentInfo(
      {
        ...edittingContentInfo,
        photographer_alt: '',
        photographer: searchUsers[index],
      });
    setSearchUsers([]);
  };

  const removePhotographer = () => {
    setEdittingContentInfo(
      {
        ...edittingContentInfo,
        photographer: {
          user_id: -1,
          nickname: '',
          profile_path: '',
          grade: 10,
          level: 0
        }
      });
  };

  return (
    <>
      {
        <>
          <Prompt when={true} message="작성 중인 내용은 저장되지 않습니다. 작성을 취소하시겠습니까?"></Prompt>
          <div className="crt-photo-right-top" >
            <CreateExhibitPhotoInfo
              photoInfo={edittingContentInfo}
              searchUsers={searchUsers}
              handleChange={handleChange}
              handleDate={handleDate}
              handlePhotographer={handlePhotographer}
              selectPhotographer={selectPhotographer}
              removePhotographer={removePhotographer} />
          </div>
          <div className="crt-photo-btn-wrapper">
            <button className="btn-cancel" onClick={cancel}>취소</button>
            <button className="btn-ok" disabled={false} onClick={submit}>완료</button>
          </div>

          {/* <div className="photo-input-area-wrapper">
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
                    </div> */}
        </>
      }
    </>
  );
}

export default EditExhibitPhotoInfo;
