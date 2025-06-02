import { useBoards } from '~/contexts/board';
import Menu from './Menu';
import { ABOUT_AAA_LINKS, TOOLS_LINKS } from '../constants';
import Drawer from '~/components/Common/Drawer';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const MenuDrawer = ({ isOpen, onClose }: Props) => {
  const { noticeBoards, communityBoards, officialBoards, photoBoards } =
    useBoards();

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
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
    </Drawer>
  );
};

export default MenuDrawer;
