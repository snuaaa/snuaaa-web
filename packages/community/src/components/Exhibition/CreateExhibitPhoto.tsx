import React, { useState, ChangeEvent } from 'react';
import ExhibitionService from '../../services/ExhibitionService';
import UserService from '../../services/UserService';
import CreateExhibitPhotoComponent from '../ExhibitBoard/CreateExhibitPhotoComponent';
import useBlockBackgroundScroll from '../../hooks/useBlockBackgroundScroll';
import CrtExhibitPhotoType from '../../types/CrtExhibitPhotoType';
import { List } from 'immutable';
import UserType from '../../types/UserType';

const TAG = 'CREATEPHOTO';
const MAX_SIZE = 100 * 1024 * 1024;

const defaultPhotoInfo: CrtExhibitPhotoType = {
  title: '',
  text: '',
  order: 0,
  photographer: {
    user_id: -1,
    nickname: '',
    profile_path: '',
    level: 0,
    grade: 10
  },
  photographer_alt: '',
  date: undefined,
  location: '',
  camera: '',
  lens: '',
  focal_length: '',
  f_stop: '',
  exposure_time: '',
  iso: ''
};

type CreateExhibitPhotoProps = {
    board_id: string
    exhibition_id: number;
    exhibition_no: number;
    togglePopUp: () => void;
    fetch: () => void;
}

function CreateExhibitPhoto({ board_id, exhibition_id, exhibition_no, togglePopUp, fetch }: CreateExhibitPhotoProps) {

  useBlockBackgroundScroll();
  const [currentSize, setCurrentSize] = useState<number>(0);
  const [imgUrls, setImgUrls] = useState<string[]>([]);
  const [photoInfos, setPhotoInfos] = useState<List<CrtExhibitPhotoType>>(List<CrtExhibitPhotoType>());
  const [uploadPhotos, setUploadPhotos] = useState<File[]>([]);
  const [imgIdx, setImgIdx] = useState<number>(-1);
  const [searchUsers, setSearchUsers] = useState<UserType[]>([]);
  const [btnDisabled, setBtnDisabled] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name: string = e.target.name;
    const photoInfo = photoInfos.get(imgIdx);
    if (photoInfo) {
      setPhotoInfos(photoInfos.set(imgIdx,
        {
          ...photoInfo,
          [name]: e.target.value
        }));
    }
  };

  const handleDate = (date: Date) => {
    const photoInfo = photoInfos.get(imgIdx);
    if (photoInfo) {
      setPhotoInfos(photoInfos.set(imgIdx,
        {
          ...photoInfo,
          'date': date
        })
      );
    }
  };

  const handlePhotographer = (e: ChangeEvent<HTMLInputElement>) => {
    const photoInfo = photoInfos.get(imgIdx);
    if (photoInfo) {
      setPhotoInfos(photoInfos.set(imgIdx,
        {
          ...photoInfo,
          photographer_alt: e.target.value
        })
      );
    }

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
    const photoInfo = photoInfos.get(imgIdx);
    if (photoInfo) {
      setPhotoInfos(photoInfos.set(imgIdx,
        {
          ...photoInfo,
          photographer_alt: '',
          photographer: searchUsers[index],
        })
      );
    }
    setSearchUsers([]);
  };

  const removePhotographer = () => {
    const photoInfo = photoInfos.get(imgIdx);
    if (photoInfo) {
      setPhotoInfos(photoInfos.set(imgIdx,
        {
          ...photoInfo,
          photographer: {
            user_id: -1,
            nickname: '',
            profile_path: '',
            level: 0,
            grade: 10,
          }
        })
      );
    }
  };

  const uploadFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (uploadPhotos.length + e.target.files.length > 20) {
        alert('한 번에 20장 이상의 사진은 업로드 할 수 없습니다.');
      }
      else if (e.target.files) {
        let tmpSize = currentSize;
        for (let i = 0; i < e.target.files.length; i++) {
          tmpSize += e.target.files[i].size;
        }

        if (tmpSize > MAX_SIZE) {
          alert('한 번에 100MB 이상의 사진은 업로드 할 수 없습니다.');
        }
        else {
          setCurrentSize(tmpSize);
          const nUploadPhotos = [];
          const nPhotoInfos = [];
          const nImgUrls = [];

          // this.imgUrls.push(...(e.target.files.map(file => URL.createObjectURL(file))))
          for (let i = 0; i < e.target.files.length; i++) {
            nImgUrls.push(URL.createObjectURL(e.target.files[i]));
            nUploadPhotos.push(e.target.files[i]);
            nPhotoInfos.push(defaultPhotoInfo);
          }
          setUploadPhotos(uploadPhotos.concat(nUploadPhotos));
          setPhotoInfos(photoInfos.concat(nPhotoInfos));
          setImgUrls(imgUrls.concat(nImgUrls));
        }
      }
    }
  };

  const removeImg = (index: number) => {

    setPhotoInfos(photoInfos.filter((value, idx) => {
      return index !== idx;
    }));
    setImgUrls(imgUrls.filter((value, idx) => {
      return index !== idx;
    }));
    setUploadPhotos(uploadPhotos.filter((value, idx) => {
      return index !== idx;
    }));
  };

  const checkForm = () => {
    if (!uploadPhotos || !uploadPhotos.length) {
      return false;
    }
    else {
      return true;
    }
  };

  const submit = async () => {
    if (!checkForm()) {
      alert('사진을 첨부해주세요');
    }
    else {
      setBtnDisabled(true);

      try {
        for (let i = 0; i < uploadPhotos.length; i++) {
          const photosForm = new FormData();
          photosForm.append('board_id', board_id);
          photosForm.append('photoInfo', JSON.stringify(photoInfos.get(i)));
          photosForm.append('exhibition_no', exhibition_no.toString());
          photosForm.append('exhibitPhoto', uploadPhotos[i]);

          try {
            await ExhibitionService.createExhibitPhoto(exhibition_id, photosForm);
          }
          catch (err) {
            console.error(`[${TAG}] ${err}`);
            throw err;
          }
        }
        togglePopUp();
        fetch();
      }
      catch (err) {
        alert('사진 생성 실패');
        setBtnDisabled(false);
      }
    }
  };

  return (
    <CreateExhibitPhotoComponent
      handleChange={handleChange}
      handleDate={handleDate}
      handlePhotographer={handlePhotographer}
      selectPhotographer={selectPhotographer}
      removePhotographer={removePhotographer}
      uploadFile={uploadFile}
      imgUrls={imgUrls}
      setImgIdx={setImgIdx}
      removeImg={removeImg}
      checkForm={submit}
      togglePopUp={togglePopUp}
      imgIdx={imgIdx}
      photoInfos={photoInfos.toJS() as CrtExhibitPhotoType[]}
      searchUsers={searchUsers}
      btnDisabled={btnDisabled}
    />
  );
}

export default CreateExhibitPhoto;
