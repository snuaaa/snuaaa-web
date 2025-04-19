import { NavLink } from 'react-router-dom';
import { Board } from '~/services/types';
import Menu from './Menu';
import { MenuLink } from './types';
import { useAuth } from '~/contexts/auth';

type NavigationProps = {
  boards: Board[];
};

const aboutAAALinks: MenuLink[] = [
  {
    name: 'AAA는?',
    url: '/about/aboutAAA',
  },
  {
    name: '찾아오는길&연락처',
    url: '/about/contact',
  },
  {
    name: '장비소개',
    url: '/about/equipment',
  },
  {
    name: '김태영 기념 관측소 소개',
    shortName: '김태영 관측소',
    url: '/about/observation',
  },
  {
    name: '동아리 발자취',
    url: '/about/history',
  },
  {
    name: '역대 회장단/임원진',
    shortName: '회장단/임원진',
    url: '/about/officers',
  },
  {
    name: 'AAA회칙',
    url: '/about/regulation',
  },
  {
    name: 'AAArchive',
    url: 'https://archive.snuaaa.net',
    isExternal: true,
  },
];

const toolsLinks: MenuLink[] = [
  {
    name: '장비 대여',
    url: '/equipment',
  },
];

const TOOLS_ACCESS_GRADE = 7;

function Navigation({ boards }: NavigationProps) {
  const noticeBoards: Board[] = boards.filter((board) => board.menu === 1);
  const communityBoards: Board[] = boards.filter((board) => board.menu === 2);
  const officialBoards: Board[] = boards.filter((board) => board.menu === 3);
  const photoBoards: Board[] = boards.filter((board) => board.menu === 4);

  const authContext = useAuth();

  return (
    <nav
      className={
        'sticky top-0 h-8 md:h-[42px] bg-[#7092C4] md:bg-[#000E2C] w-full z-10 text-[0.8rem] md:text-base shadow-[0_1px_1px_0_rgba(105,105,105,0.61)] md:shadow-[0_2px_2px_0_rgba(50,45,119,0.61)]'
      }
    >
      <ul className="h-full w-full flex justify-around md:justify-center items-center">
        <Menu menuName={<NavLink to="/">★</NavLink>} />
        <Menu menuName="A.A.A." menuItems={aboutAAALinks} />
        <Menu menuName="Notice" menuItems={noticeBoards} />
        <Menu menuName="Daily" menuItems={communityBoards} />
        <Menu menuName="Docu" menuItems={officialBoards} />
        <Menu menuName="Photo" menuItems={photoBoards} />
        <Menu
          menuName="Tools"
          menuItems={
            authContext.authInfo.user.grade <= TOOLS_ACCESS_GRADE
              ? toolsLinks
              : []
          }
        />
      </ul>
    </nav>
  );
}

export default Navigation;
