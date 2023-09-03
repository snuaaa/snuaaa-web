import React, { useState } from 'react';
import Image from './AaaImage';
import defaultProfile from 'assets/img/common/profile.png';
import UserType from '../../types/UserType';

type ProfilePopUpProps = {
    userInfo: UserType;
    cancel: () => void;
}

function ProfilePopUp({ userInfo, cancel }: ProfilePopUpProps) {


  return (
    <div className="profile-mini-wrapper">
      <div className="profile-img">
        <div className={`profile-img-border grade${userInfo.grade}`}>
          <Image imgSrc={userInfo.profile_path} defaultImgSrc={defaultProfile} />
        </div>
      </div>
    </div>
  );
}

export default ProfilePopUp;