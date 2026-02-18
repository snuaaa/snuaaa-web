import { useState, PropsWithChildren } from 'react';
import { Link } from '@tanstack/react-router';

import AaaImage from './AaaImage';
import defaultProfile from '~/assets/img/common/profile.png';
import { gradeAssigner } from '../../utils/gradeAssigner';
import { User } from '~/services/types';

type UserActionDrawerProps = {
  userInfo: User;
  className?: string;
};

function UserActionDrawer({
  children,
  userInfo,
  className,
}: PropsWithChildren<UserActionDrawerProps>) {
  const [isOpened, setIsOpened] = useState(false);

  // useEffect(() => {
  //     if (isOpened) {
  //         window.addEventListener('click', closeDrawer, true)
  //     }
  //     else {
  //         window.removeEventListener('click', closeDrawer, true)
  //     }
  // }, [isOpened])

  const closeDrawer = function () {
    setIsOpened(false);
    // window.removeEventListener('click', closeDrawer, true)
  };

  const wrapperClass = className ? className : '';

  return (
    <>
      <span
        className={`cursor-pointer actions-drawer-target ${wrapperClass}`}
        onClick={() => setIsOpened(!isOpened)}
      >
        {children}
        <div className="actions-drawer">
          {isOpened && (
            <>
              <div className="profile-popup-wrapper" onClick={closeDrawer}>
                {userInfo.deleted_at ? (
                  <div
                    className="profile-popup"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h5>탈퇴한 회원입니다.</h5>
                  </div>
                ) : (
                  <div
                    className="profile-popup"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h5>회원 정보</h5>
                    <div className="profile-img-wrapper with-border">
                      <div
                        className={`profile-img-border grade${userInfo.grade ? userInfo.grade : 9}`}
                      >
                        <AaaImage
                          className="profile-img"
                          imgSrc={userInfo.profile_path}
                          defaultImgSrc={defaultProfile}
                        />
                      </div>
                    </div>
                    <div className="profile-nickname">{userInfo.nickname}</div>
                    <div className="profile-units-wrapper">
                      {userInfo.aaa_no && (
                        <div className="profile-unit">
                          <div className="profile-unit-label">가입번호</div>
                          <div className="profile-unit-info">
                            {userInfo.aaa_no}
                          </div>
                        </div>
                      )}
                      <div className="profile-unit">
                        <div className="profile-unit-label">등급</div>
                        <div className="profile-unit-info">
                          {userInfo.grade}&nbsp;{gradeAssigner(userInfo.grade)}
                        </div>
                      </div>
                      <div className="profile-unit">
                        <div className="profile-unit-label">이메일</div>
                        <div className="profile-unit-info">
                          {userInfo.email}
                        </div>
                      </div>
                    </div>
                    <Link
                      className={'profile-more-btn'}
                      to="/userpage/$uuid"
                      params={{ uuid: userInfo.user_uuid }}
                    >
                      <div>상세 정보</div>
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </span>
    </>
  );
}

export default UserActionDrawer;
