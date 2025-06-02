import { useState } from 'react';
import logo from '~/assets/img/logo_white.png';
import imgProfile from '~/assets/img/common/profile.png';
import Navigation from '~/components/Header/Navigation';
import PopupUser from '~/components/Header/PopupUser';
import Image from '~/components/Common/AaaImage';
import { useHistory } from 'react-router';
import { useAuth } from '~/contexts/auth';
import backgroundImg from '~/assets/img/header.gif';
import { useViewportSize } from '~/contexts/viewportSize';
import Drawer from './Drawer';

function Header() {
  const [isShowPopupUser, setIsShowPopupUser] = useState(false);
  const history = useHistory();
  const authContext = useAuth();

  const togglePopup = () => {
    setIsShowPopupUser(!isShowPopupUser);
  };

  const handleClickLogo = () => {
    if (history.location.pathname === '/') {
      window.location.reload();
    } else {
      history.push('/');
    }
  };

  const isNotGuest = authContext.authInfo.user.grade < 10;

  const viewportSize = useViewportSize();
  const isMobile = ['Tablet', 'Mobile'].includes(viewportSize);

  const { profile_path } = authContext.authInfo.user;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => {
    setIsDrawerOpen(true);
  };

  return (
    <>
      <div id="aaa-top" className="w-full bg-[#040c22]">
        <div className="w-full flex md:max-w-[1920px] relative m-auto justify-between">
          <img
            src={backgroundImg}
            alt="background-header"
            className="hidden md:block md:h-[250px] md:object-cover"
          ></img>
          <div className="md:absolute w-full flex justify-center md:py-2 md:px-6">
            <button
              className="text-white flex items-center px-2 text-xl md:hidden"
              onClick={openDrawer}
            >
              <i className="ri-menu-line"></i>
            </button>
            <button
              className="text-white flex items-center gap-1 pl-1"
              onClick={handleClickLogo}
            >
              <img
                src={logo}
                alt="logo"
                className="w-10 h-10 md:w-12 md:h-12 shrink-0"
              />
              <p className="text-lg">서울대학교 아마추어 천문회</p>
            </button>
            {isNotGuest ? (
              <div className="flex my-1 mr-3 md:my-0 md:mr-10 md:justify-center">
                <Image
                  className="w-10 h-10 md:w-[50px] md:h-[50px] rounded-full cursor-pointer object-cover"
                  onClick={togglePopup}
                  imgSrc={profile_path}
                  defaultImgSrc={imgProfile}
                />
                {isShowPopupUser && (
                  <PopupUser
                    profile_path={profile_path}
                    togglePopup={togglePopup}
                    logout={authContext.authLogout}
                  />
                )}
              </div>
            ) : (
              <button
                className="ml-auto text-white mr-1"
                onClick={authContext.authLogout}
              >
                LOGOUT
              </button>
            )}
          </div>
        </div>
      </div>
      {isMobile ? (
        <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      ) : (
        <Navigation />
      )}
    </>
  );
}

export default Header;
