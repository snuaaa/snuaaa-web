import { ChangeEvent, FC, useState } from 'react';
import UserService from 'services/UserService';
import ExhibitPhotoService, {
  UpdateExhibitPhotoRequest,
} from 'services/ExhibitPhotoService';
import Image from 'components/Common/AaaImage';
import CreateExhibitPhotoInfo from './CreateExhibitPhotoInfo';
import { ExhibitPhoto, User } from 'services/types';

type Props = {
  onCancel: () => void;
  onUpdate: () => void;
  contentInfo: ExhibitPhoto;
};

const EditExhibitPhoto: FC<Props> = ({ contentInfo, onCancel, onUpdate }) => {
  const [photoInfo, setPhotoInfo] = useState<UpdateExhibitPhotoRequest>({
    title: contentInfo.title,
    text: contentInfo.text,
    order: contentInfo.exhibitPhoto.order,
    photographer: contentInfo.exhibitPhoto.photographer,
    photographer_alt: contentInfo.exhibitPhoto.photographer_alt,
    date:
      contentInfo.exhibitPhoto.date && new Date(contentInfo.exhibitPhoto.date),
    location: contentInfo.exhibitPhoto.location,
    camera: contentInfo.exhibitPhoto.camera,
    lens: contentInfo.exhibitPhoto.lens,
    focal_length: contentInfo.exhibitPhoto.focal_length,
    f_stop: contentInfo.exhibitPhoto.f_stop,
    exposure_time: contentInfo.exhibitPhoto.exposure_time,
    iso: contentInfo.exhibitPhoto.iso,
  });

  const [searchUsers, setSearchUsers] = useState<User[]>([]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setPhotoInfo({
      ...photoInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleDate = (date: Date) => {
    setPhotoInfo({
      ...photoInfo,
      date,
    });
  };

  const handlePhotographer = (e: ChangeEvent<HTMLInputElement>) => {
    setPhotoInfo({
      ...photoInfo,
      photographer_alt: e.target.value,
    });

    if (e.target.value) {
      fetchUsers(e.target.value);
    }
  };

  const fetchUsers = async (name: string) => {
    try {
      const { userList } = await UserService.searchMini(name);
      setSearchUsers(userList);
    } catch (err) {
      console.error(err);
    }
  };

  const selectPhotographer = (index: number) => {
    setPhotoInfo({
      ...photoInfo,
      photographer_alt: '',
      photographer: {
        user_id: searchUsers[index].user_id,
        nickname: searchUsers[index].nickname,
        profile_path: searchUsers[index].profile_path,
      },
    });
    setSearchUsers([]);
  };

  const removePhotographer = () => {
    setPhotoInfo({
      ...photoInfo,
      photographer: undefined,
    });
  };

  const submit = async () => {
    try {
      await ExhibitPhotoService.updateExhibitPhoto(
        contentInfo.content_id,
        photoInfo,
      );
      onUpdate();
    } catch (err) {
      console.error(err);
      alert('업데이트 실패');
    }
  };

  return (
    <div className="crt-photo-popup">
      <div className="crt-photo-wrp edt-photo-wrp">
        <div className="crt-photo-header">
          <h3>사진 수정</h3>
        </div>
        <div className="crt-photo-body">
          <div className="crt-photo-center">
            <Image imgSrc={contentInfo.exhibitPhoto.file_path} />
          </div>
          <div className="crt-photo-right">
            <CreateExhibitPhotoInfo
              photoInfo={photoInfo}
              searchUsers={searchUsers}
              handleChange={handleChange}
              handleDate={handleDate}
              handlePhotographer={handlePhotographer}
              selectPhotographer={selectPhotographer}
              removePhotographer={removePhotographer}
            />

            <div className="crt-photo-btn-wrapper">
              <button className="btn-cancel" onClick={onCancel}>
                취소
              </button>
              <button className="btn-ok" onClick={submit}>
                완료
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditExhibitPhoto;
