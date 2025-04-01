import Image from './AaaImage';
import defaultProfile from '~/assets/img/common/profile.png';
import { User } from '~/services/types';

type ProfilePopUpProps = {
  userInfo: User;
};

function ProfilePopUp({ userInfo }: ProfilePopUpProps) {
  return (
    <div className="profile-mini-wrapper">
      <div className="profile-img">
        <div className={`profile-img-border grade${userInfo.grade}`}>
          <Image
            imgSrc={userInfo.profile_path}
            defaultImgSrc={defaultProfile}
          />
        </div>
      </div>
    </div>
  );
}

export default ProfilePopUp;
