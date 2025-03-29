import { useState, ChangeEvent } from 'react';
import UserService from '~/services/UserService';
import CreateExhibitPhotoComponent from './ExhibitPhoto/CreateExhibitPhotoComponent';
import useBlockBackgroundScroll from '~/hooks/useBlockBackgroundScroll';
import { List } from 'immutable';
import { User } from '~/services/types';
import ExhibitPhotoService, {
  ExhibitPhotoInfo,
} from '~/services/ExhibitPhotoService';

const MAX_SIZE = 100 * 1024 * 1024;

const defaultPhotoInfo: ExhibitPhotoInfo = {
  title: '',
  text: '',
  order: 0,
  photographer_alt: '',
  date: undefined,
  location: '',
  camera: '',
  lens: '',
  focal_length: '',
  f_stop: '',
  exposure_time: '',
  iso: '',
};

type CreateExhibitPhotoProps = {
  board_id: string;
  exhibition_id: number;
  exhibition_no: number;
  onCreate: () => void;
  onCancel: () => void;
};

function CreateExhibitPhoto({
  board_id,
  exhibition_id,
  exhibition_no,
  onCreate,
  onCancel,
}: CreateExhibitPhotoProps) {
  useBlockBackgroundScroll();
  const [currentSize, setCurrentSize] = useState<number>(0);
  const [imgUrls, setImgUrls] = useState<string[]>([]);
  const [photoInfos, setPhotoInfos] =
    useState<List<ExhibitPhotoInfo>>(List<ExhibitPhotoInfo>());
  const [uploadPhotos, setUploadPhotos] = useState<File[]>([]);
  const [imgIdx, setImgIdx] = useState<number>(-1);
  const [searchUsers, setSearchUsers] = useState<User[]>([]);
  const [btnDisabled, setBtnDisabled] = useState<boolean>(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const name: string = e.target.name;
    const photoInfo = photoInfos.get(imgIdx);
    if (photoInfo) {
      setPhotoInfos(
        photoInfos.set(imgIdx, {
          ...photoInfo,
          [name]: e.target.value,
        }),
      );
    }
  };

  const handleDate = (date: Date) => {
    const photoInfo = photoInfos.get(imgIdx);
    if (photoInfo) {
      setPhotoInfos(
        photoInfos.set(imgIdx, {
          ...photoInfo,
          date: date,
        }),
      );
    }
  };

  const handlePhotographer = (e: ChangeEvent<HTMLInputElement>) => {
    const photoInfo = photoInfos.get(imgIdx);
    if (photoInfo) {
      setPhotoInfos(
        photoInfos.set(imgIdx, {
          ...photoInfo,
          photographer_alt: e.target.value,
        }),
      );
    }

    if (e.target.value) {
      fetchUsers(e.target.value);
    }
  };

  const fetchUsers = async (name: string) => {
    UserService.searchMini(name)
      .then((res) => {
        setSearchUsers(res.userList);
      })
      .catch((err: Error) => {
        console.error(err);
      });
  };

  const selectPhotographer = (index: number) => {
    const photoInfo = photoInfos.get(imgIdx);
    if (photoInfo) {
      setPhotoInfos(
        photoInfos.set(imgIdx, {
          ...photoInfo,
          photographer_alt: '',
          photographer: searchUsers[index],
        }),
      );
    }
    setSearchUsers([]);
  };

  const removePhotographer = () => {
    const photoInfo = photoInfos.get(imgIdx);
    if (photoInfo) {
      setPhotoInfos(
        photoInfos.set(imgIdx, {
          ...photoInfo,
          photographer: undefined,
        }),
      );
    }
  };

  const uploadFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (uploadPhotos.length + e.target.files.length > 20) {
        alert('한 번에 20장 이상의 사진은 업로드 할 수 없습니다.');
      } else if (e.target.files) {
        let tmpSize = currentSize;
        for (let i = 0; i < e.target.files.length; i++) {
          tmpSize += e.target.files[i].size;
        }

        if (tmpSize > MAX_SIZE) {
          alert('한 번에 100MB 이상의 사진은 업로드 할 수 없습니다.');
        } else {
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
    setPhotoInfos(
      photoInfos.filter((value, idx) => {
        return index !== idx;
      }),
    );
    setImgUrls(
      imgUrls.filter((value, idx) => {
        return index !== idx;
      }),
    );
    setUploadPhotos(
      uploadPhotos.filter((value, idx) => {
        return index !== idx;
      }),
    );
  };

  const checkForm = () => {
    if (!uploadPhotos || !uploadPhotos.length) {
      return false;
    } else {
      return true;
    }
  };

  const submit = async () => {
    if (!checkForm()) {
      alert('사진을 첨부해주세요');
    } else {
      setBtnDisabled(true);

      try {
        for (let i = 0; i < uploadPhotos.length; i++) {
          try {
            const photoInfo = photoInfos.get(i);
            if (photoInfo) {
              await ExhibitPhotoService.createExhibitPhoto(exhibition_id, {
                board_id,
                photoInfo,
                exhibition_no: exhibition_no,
                exhibitPhoto: uploadPhotos[i],
              });
            }
          } catch (err) {
            console.error(err);
            throw err;
          }
        }
        onCreate();
      } catch (err) {
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
      onCancel={onCancel}
      imgIdx={imgIdx}
      photoInfos={photoInfos.toJS() as ExhibitPhotoInfo[]}
      searchUsers={searchUsers}
      btnDisabled={btnDisabled}
    />
  );
}

export default CreateExhibitPhoto;
