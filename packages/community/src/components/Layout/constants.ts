import { MenuLink } from './types';

/** Grade that may rent equipment (lower is more privileged). */
export const EQUIPMENT_GRADE = 7;

/** 추억 만들기, the album board shown on the home page. */
export const MEMORY_BOARD = 'brd31';
/** 별사진 */
export const ASTRO_PHOTO_BOARD = 'brd32';

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
    accessGrade: EQUIPMENT_GRADE,
  },
];

/** Sites members check before observing. Opened in a new tab. */
export const EXTERNAL_LINKS: MenuLink[] = [
  { name: '기상청 날씨', url: 'https://www.weather.go.kr', isExternal: true },
  { name: 'Stellarium', url: 'https://stellarium-web.org/', isExternal: true },
  { name: 'NASA APOD', url: 'https://apod.nasa.gov/apod/', isExternal: true },
];

/** 회원 관리 is for grade 6 and above, except 전회장 (4). */
export const canManageUsers = (grade: number) => grade <= 6 && grade !== 4;
