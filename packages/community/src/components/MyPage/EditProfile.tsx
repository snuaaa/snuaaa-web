import React, { useContext, useState, useEffect, ChangeEvent } from 'react';

import UserService from '../../services/UserService';
import Loading from '../Common/Loading';
import ProfileComponent from './ProfileComponent';
import AuthContext from '../../contexts/AuthContext';

const TAG = 'PROFILE';

type InputFormat = {
    label: string;
    value: string;
    valid?: boolean | null;
    isRequired: boolean;
    regExp?: string;
}

const defaultUserFormat: InputFormat[] = [
  {
    label: 'id',
    value: '',
    valid: null,
    isRequired: true,
    regExp: '^[A-Za-z0-9]{4,12}$'
  },
  {
    label: 'nickname',
    value: '',
    valid: null,
    isRequired: true,
    regExp: '^[A-Za-z0-9]{4,12}$'
  },
  {
    label: 'username',
    value: '',
    valid: null,
    isRequired: true,
    regExp: '^[가-힣]{2,6}$|^[A-Za-z ]{2,20}$'
  },
  {
    label: 'email',
    value: '',
    valid: null,
    isRequired: true,
    regExp: '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$'
  },
  {
    label: 'mobile',
    value: '',
    valid: null,
    isRequired: true,
    regExp: '^[0-9]{1,8}-[0-9]{1,8}-[0-9]{1,8}$'
  },
  {
    label: 'aaa_no',
    value: '',
    valid: null,
    isRequired: false,
    regExp: '^[0-9]{2}[Aa]{3}-[0-9]{1,3}|[Aa]{3}[0-9]{2}-[0-9]{1,3}$'
  },
  {
    label: 'col_no',
    value: '',
    valid: null,
    isRequired: false,
    regExp: '^[0-9]{2}$'
  },
  {
    label: 'major',
    value: '',
    valid: null,
    isRequired: false
  },
  {
    label: 'introduction',
    value: '',
    valid: null,
    isRequired: false
  }
];

function EditProfile() {

  const authContext = useContext(AuthContext);

  const [userInfo, setUserInfo] = useState(defaultUserFormat);
  const [profileImg, setProfileImg] = useState<File>();
  const [profilePath, setProfilePath] = useState('');
  const [isProfileImgChanged, setIsProfileImgChanged] = useState<boolean>(false);
  const [isShow, setIsShow] = useState<boolean>(false);

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {

    setIsShow(false);

    await UserService.retrieveUserInfo()
      .then((res) => {
        const resUserInfo = res.data.userInfo;

        setUserInfo(
          userInfo.map((info) => {
            // let label = info.label
            // if(label === 'id' && resUserInfo[label]) {
            //     info.value = resUserInfo[label]
            // }
            if (info.label === 'id' && resUserInfo.id) {
              info.value = resUserInfo.id;
            }
            if (info.label === 'nickname' && resUserInfo.nickname) {
              info.value = resUserInfo.nickname;
            }
            if (info.label === 'username' && resUserInfo.username) {
              info.value = resUserInfo.username;
            }
            if (info.label === 'aaa_no' && resUserInfo.aaa_no) {
              info.value = resUserInfo.aaa_no;
            }
            if (info.label === 'col_no' && resUserInfo.col_no) {
              info.value = resUserInfo.col_no;
            }
            if (info.label === 'major' && resUserInfo.major) {
              info.value = resUserInfo.major;
            }
            if (info.label === 'email' && resUserInfo.email) {
              info.value = resUserInfo.email;
            }
            if (info.label === 'mobile' && resUserInfo.mobile) {
              info.value = resUserInfo.mobile;
            }
            if (info.label === 'introduction' && resUserInfo.introduction) {
              info.value = resUserInfo.introduction;
            }
            return { ...info, valid: true };
          })
        );
        setProfilePath(resUserInfo.profile_path);
        setIsProfileImgChanged(false);
        setIsShow(true);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    setUserInfo(userInfo.map((info) => {
      if (info.label === e.target.name) {
        if (info.regExp) {
          const re = new RegExp(info.regExp);
          const valid = e.target.value ? re.test(e.target.value) : null;
          return { ...info, value: e.target.value, valid: valid };
        }
        else {
          return { ...info, value: e.target.value };
        }
      }
      else {
        return info;
      }
    }));
  };

  const uploadProfileImg = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImg(e.target.files[0]);
      setProfilePath(URL.createObjectURL(e.target.files[0]));
      setIsProfileImgChanged(true);
    }
  };

  const updateInfo = async () => {

    setIsShow(false);
    const data = new FormData();
    userInfo.forEach((info) => {
      data.append(info.label, info.value);
    });

    if (profileImg) {
      data.append('profileImg', profileImg);
    }

    await UserService.updateUserInfo(data)
      .then(() => {
        alert('업데이트 성공');
        window.location.reload();
      })
      .catch((err: Error) => {
        console.error(err);
        alert('업데이트 실패');
      });
  };

  const deleteUser = async () => {
    const goDrop = window.confirm('정말로 탈퇴하시겠습니까?');
    if (goDrop) {
      await UserService.deleteUserInfo()
        .then(() => {
          alert('탈퇴 요청이 정상적으로 처리되었습니다.');
          // this.props.onLogout();
          authContext.authLogout();
        })
        .catch((err: Error) => {
          console.error(err);
          alert('탈퇴 실패');
        });
    }
  };

  const checkValid = () => {
    let valid: boolean | null | undefined = true;

    userInfo.forEach((info) => {
      if (info.isRequired || (info.valid !== null)) {
        valid = valid && info.valid;
      }
    });
    return valid;
  };

  console.log(`[${TAG}] render..`);
  return (
    isShow ?
      <ProfileComponent
        userInfo={userInfo}
        profilePath={profilePath}
        handleChange={handleChange}
        uploadProfileImg={uploadProfileImg}
        isProfileImgChanged={isProfileImgChanged}
        updateInfo={updateInfo}
        deleteUser={deleteUser}
        valid={checkValid()} />
      :
      <Loading />
  );
}

export default EditProfile;
