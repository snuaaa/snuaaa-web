import { useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import Image from '../../components/Common/AaaImage';
import imgProfile from '../../assets/img/common/profile.png';
import { useAuth } from '~/contexts/auth';

type Props = {
  profile_path: string;
  togglePopup: () => void;
  logout: () => void;
};

// TODO: rename to ProfileMenu
function PopupUser({ profile_path, togglePopup, logout }: Props) {
  const authContext = useAuth();

  useEffect(() => {
    // window.addEventListener('click', togglePopup);
    document.body.classList.add('enif-overflow-hidden-mobile');
    return function () {
      // window.removeEventListener('click', togglePopup);
      document.body.classList.remove('enif-overflow-hidden-mobile');
    };
  }, []);

  // 전회장(4)은 제외
  const hasManagementAuthority =
    authContext.authInfo.user.grade <= 6 &&
    authContext.authInfo.user.grade !== 4;

  return (
    <div
      className="fixed md:absolute left-0 md:left-auto top-0 md:top-[70px] z-[99] md:z-[11] w-full md:w-[150px] h-full md:h-[200px] bg-[#06234eee] md:bg-[#6181b0] md:rounded-[10px]
        flex flex-col items-center pt-20 md:pt-8 text-white gap-8 md:gap-5"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute top-4 right-4 md:hidden" onClick={togglePopup}>
        <i className="ri-icons ri-close-fill text-3xl"></i>
      </div>
      <div className="md:hidden">
        <Image
          imgSrc={profile_path}
          defaultImgSrc={imgProfile}
          className="w-32 h-32 rounded-full object-cover"
        />
      </div>
      <Link to="/mypage/$view" params={{ view: 'info' }} onClick={togglePopup}>
        <p className="text-2xl md:text-base">My Page</p>
      </Link>
      {hasManagementAuthority && (
        <Link to="/admin/user" onClick={togglePopup}>
          <p className="text-2xl md:text-base">
            {/* <i className="ri-admin-line"></i> */}
            회원 관리
          </p>
        </Link>
      )}
      <button
        onClick={() => {
          logout();
          togglePopup();
        }}
        className="text-2xl md:text-base"
      >
        Log out
      </button>
    </div>
  );
}

export default PopupUser;
