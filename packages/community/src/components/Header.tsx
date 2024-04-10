import { useState } from 'react';
import logo from '../assets/img/logo_white.png';
import imgProfile from '../assets/img/common/profile.png';
import Navigation from '../components/Header/Navigation';
import PopupUser from '../components/Header/PopupUser';
import Image from '../components/Common/AaaImage';
import { useHistory } from 'react-router';
import { useAuth } from 'contexts/auth';
import { useBoards } from 'contexts/board';

function Header() {
  const [isShowPopupUser, setIsShowPopupUser] = useState(false);
  const history = useHistory();
  const boardContext = useBoards();
  const authContext = useAuth();

  const togglePopup = () => {
    setIsShowPopupUser(!isShowPopupUser);
  };

  const clickLogo = () => {
    if (history.location.pathname === '/') {
      window.location.reload();
    } else {
      history.push('/');
    }
  };

  return (
    <>
      <div id="aaa-top" className="main-header-wrapper">
        <div className="main-header">
          <div className="header-logo" onClick={clickLogo}>
            <img src={logo} alt="logo" />
            <p>서울대학교 아마추어 천문회</p>
          </div>
          {authContext.authInfo.user.grade < 10 ? (
            <div className="profile-img-wrapper">
              <Image
                className="profile-img"
                onClick={togglePopup}
                imgSrc={authContext.authInfo.user.profile_path}
                defaultImgSrc={imgProfile}
              />
              {isShowPopupUser && (
                <PopupUser
                  profile_path={authContext.authInfo.user.profile_path}
                  togglePopup={togglePopup}
                  logout={authContext.authLogout}
                />
              )}
            </div>
          ) : (
            <div className="guest-logout-wrapper">
              <p onClick={authContext.authLogout}>LOGOUT</p>
            </div>
          )}
        </div>
      </div>
      <Navigation boards={boardContext.boardsInfo} />
    </>
  );
}

export default Header;
