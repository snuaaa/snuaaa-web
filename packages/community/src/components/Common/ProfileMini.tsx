import React, { useState } from 'react';
import Image from './AaaImage';
import defaultProfile from 'assets/img/common/profile.png';
import { breakLine } from '../../utils/breakLine';
import UserActionDrawer from './UserActionDrawer';
import UserType from '../../types/UserType';

function ProfileMini({ userInfo }: { userInfo: UserType }) {

  const [isExpand, setIsExpand] = useState(false);

  const descClass = isExpand ? 'userdesc expanded' : 'userdesc';

  return (
    <div className="profile-mini-wrapper">
      <UserActionDrawer userInfo={userInfo}>
        <div className="profile-img-wrapper with-border">
          <div className={`profile-img-border grade${userInfo.grade}`}>
            <Image className="profile-img" imgSrc={userInfo.profile_path} defaultImgSrc={defaultProfile} />
          </div>
        </div>
      </UserActionDrawer>
      <div className="nickname">{userInfo.nickname}</div>
      <div className={descClass}>{breakLine(userInfo.introduction)}</div>
      <div className="icon-expand">
        <i className={`${isExpand ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} enif-f-1x enif-pointer`} onClick={() => setIsExpand(!isExpand)}></i>
      </div>
    </div>
  );
}

export default ProfileMini;