import { useEffect } from 'react';
import { useBoards } from '~/contexts/board';
import Menu from './Menu';
import { ABOUT_AAA_LINKS, TOOLS_LINKS } from '../constants';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const Drawer = ({ isOpen, onClose }: Props) => {
  const { noticeBoards, communityBoards, officialBoards, photoBoards } =
    useBoards();

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    document.body.classList.add('overflow-hidden');
    return function () {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 h-full w-full z-30 ${isOpen ? 'visible' : 'invisible'} transition-all duration-300 ease-out`}
    >
      <div
        className="bg-slate-800 opacity-50 absolute inset-0 transition-all duration-300 ease-out"
        onClick={onClose}
      ></div>

      <div
        className={`absolute top-0 left-0 ${isOpen ? 'max-w-full' : 'max-w-0'} h-full bg-slate-700 transition-all duration-300 ease-out z-10 overflow-hidden`}
      >
        {/* NOTE: transition이 끊기는 이슈로 pl, pr은 자식에서 적용 */}
        <ul className="flex flex-col gap-6 py-4 pl-2 pr-10 text-white">
          <Menu
            menuName="A.A.A."
            menuItems={ABOUT_AAA_LINKS}
            icon={<i className="ri-sparkling-line"></i>}
          />
          <Menu
            menuName="Notice"
            menuItems={noticeBoards}
            icon={<i className="ri-notification-line"></i>}
          />
          <Menu
            menuName="Daily"
            menuItems={communityBoards}
            icon={<i className="ri-message-3-line"></i>}
          />
          <Menu
            menuName="Docu"
            menuItems={officialBoards}
            icon={<i className="ri-article-line"></i>}
          />
          <Menu
            menuName="Photo"
            menuItems={photoBoards}
            icon={<i className="ri-image-line"></i>}
          />
          <Menu
            menuName="Tools"
            menuItems={TOOLS_LINKS}
            icon={<i className="ri-tools-line"></i>}
          />
        </ul>
      </div>
    </div>
  );
};

export default Drawer;
