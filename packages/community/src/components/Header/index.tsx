import { useState } from 'react';

import imgProfile from '~/assets/img/common/profile.png';
import Navigation from '~/components/Header/Navigation';
import PopupUser from '~/components/Header/PopupUser';
import Image from '~/components/Common/AaaImage';

import { useAuth } from '~/contexts/auth';
import { useViewportSize } from '~/contexts/viewportSize';

import MenuDrawer from '~/components/Header/MenuDrawer';
import backgroundImg from '~/assets/img/header.gif';

function Header() {
  const [isShowPopupUser, setIsShowPopupUser] = useState(false);
  const authContext = useAuth();

  const togglePopup = () => {
    setIsShowPopupUser(!isShowPopupUser);
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
      <div id="aaa-top" className="w-full bg-[#040c22] relative">
        {/* Background image container */}
        <div className="w-full relative md:max-w-[1920px] mx-auto">
          <img
            src={backgroundImg}
            alt="background-header"
            className="hidden md:block w-full h-[220px] object-cover"
          />
          {/* Bottom gradient fade */}
          <div className="hidden md:block absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#040c22] to-transparent"></div>

          {/* Top bar: Hamburger (mobile) + Profile */}
          <div className="md:absolute md:top-0 w-full flex items-center justify-between py-2 px-4 md:px-8">
            {/* Mobile hamburger */}
            <button
              className="text-white flex items-center px-1 text-xl md:hidden"
              onClick={openDrawer}
            >
              <i className="ri-menu-line"></i>
            </button>

            {/* Spacer for desktop (logo removed, profile stays right) */}
            <div className="hidden md:block" />

            {/* Profile */}
            {isNotGuest ? (
              <div className="relative flex items-center">
                <Image
                  className="w-9 h-9 md:w-11 md:h-11 rounded-full cursor-pointer object-cover ring-2 ring-white/20 hover:ring-[#49A0AE]/60 transition-all duration-300"
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
                className="text-white/70 hover:text-white text-sm font-medium transition-colors"
                onClick={authContext.authLogout}
              >
                LOGOUT
              </button>
            )}
          </div>
        </div>

        {/* Desktop Navigation — integrated into header */}
        {!isMobile && <Navigation />}
      </div>

      {/* Mobile drawer */}
      {isMobile && (
        <MenuDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}
    </>
  );
}

export default Header;
