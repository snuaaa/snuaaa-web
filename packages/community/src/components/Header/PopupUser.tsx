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

function PopupUser({ profile_path, togglePopup, logout }: Props) {
  const authContext = useAuth();

  useEffect(() => {
    document.body.classList.add('enif-overflow-hidden-mobile');
    return function () {
      document.body.classList.remove('enif-overflow-hidden-mobile');
    };
  }, []);

  // 전회장(4)은 제외
  const hasManagementAuthority =
    authContext.authInfo.user.grade <= 6 &&
    authContext.authInfo.user.grade !== 4;

  return (
    <div
      className="fixed md:absolute left-0 md:left-auto md:right-0 top-0 md:top-14 z-[99] md:z-[11]
        w-full md:w-[180px] h-full md:h-auto
        bg-[#040c22]/95 md:bg-[#1a2d4d]/95
        md:backdrop-blur-xl md:border md:border-white/15 md:rounded-xl md:shadow-[0_8px_30px_rgba(0,0,0,0.4)]
        flex flex-col items-center
        pt-20 md:pt-0 md:py-4
        text-white gap-6 md:gap-0"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Mobile close button */}
      <div className="absolute top-4 right-4 md:hidden" onClick={togglePopup}>
        <i className="ri-icons ri-close-fill text-3xl text-white/70 hover:text-white transition-colors cursor-pointer"></i>
      </div>

      {/* Mobile profile image */}
      <div className="md:hidden">
        <Image
          imgSrc={profile_path}
          defaultImgSrc={imgProfile}
          className="w-28 h-28 rounded-full object-cover ring-2 ring-white/20"
        />
      </div>

      <Link
        to="/mypage/$view"
        params={{ view: 'info' }}
        onClick={togglePopup}
        className="w-full px-5 py-3 md:py-2.5 text-center md:text-left text-xl md:text-sm text-white/80 hover:text-white hover:bg-white/[0.08] transition-colors"
      >
        My Page
      </Link>
      {hasManagementAuthority && (
        <Link
          to="/admin/user"
          onClick={togglePopup}
          className="w-full px-5 py-3 md:py-2.5 text-center md:text-left text-xl md:text-sm text-white/80 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          회원 관리
        </Link>
      )}
      <button
        onClick={() => {
          logout();
          togglePopup();
        }}
        className="w-full px-5 py-3 md:py-2.5 text-center md:text-left text-xl md:text-sm text-white/80 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
      >
        Log out
      </button>
    </div>
  );
}

export default PopupUser;
