import { NavLink } from 'react-router-dom';
import { Board } from 'services/types';
import Menu, { MenuLink } from './Menu';

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
    url: 'https://archive.snuaaa.net/EquipmentSystem',
    isExternal: true,
  },
];

function Navigation({ boards }: NavigationProps) {
  const activeStyle = {
    fontWeight: 900,
    color: '#fad55f',
  };

  const noticeBoards: Board[] = boards.filter((board) => board.menu === 1);
  const communityBoards: Board[] = boards.filter((board) => board.menu === 2);
  const officialBoards: Board[] = boards.filter((board) => board.menu === 3);
  const photoBoards: Board[] = boards.filter((board) => board.menu === 4);

  return (
    <div className={'main-menu-nav-wrapper relative'}>
      <nav>
        {/* <input className="nav-toggle" id="nav-toggle" type="checkbox"/> 
                    <label className="navicon" htmlFor="nav-toggle"><span className="navicon-bar"></span></label> */}
        <ul className="nav-items">
          <li className="menu-nav">
            <NavLink to="/" activeStyle={activeStyle}>
              <div className="menu-item-1">★</div>
            </NavLink>
          </li>
          <Menu menuName="A.A.A." links={aboutAAALinks} />
          <Menu menuName="A-Notice" boards={noticeBoards} />
          <Menu menuName="A-Daily" boards={communityBoards} />
          <Menu menuName="A-Docu" boards={officialBoards} />
          <Menu menuName="A-Photo" boards={photoBoards} />
          <Menu menuName="A-Tools" links={toolsLinks} />
        </ul>
      </nav>
    </div>
  );
}

export default Navigation;
