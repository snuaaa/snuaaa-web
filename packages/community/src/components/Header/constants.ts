import { MenuLink } from './Navigation/types';

export const ABOUT_AAA_LINKS: MenuLink[] = [
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

export const TOOLS_LINKS: MenuLink[] = [
  {
    name: '장비 대여',
    url: '/equipment',
    accessGrade: 7,
  },
];
