/** Grade that may rent equipment (lower is more privileged). */
export const EQUIPMENT_GRADE = 7;

/** 추억 만들기, the album board shown on the home page. */
export const MEMORY_BOARD = 'brd31';
/** 별사진 */
export const ASTRO_PHOTO_BOARD = 'brd32';

/** 동아리 소개 lives on the club's public site, not in the community. */
export const CLUB_INTRO_URL = 'https://www.snuaaa.net';

/** 회원 관리 is for grade 6 and above, except 전회장 (4). */
export const canManageUsers = (grade: number) => grade <= 6 && grade !== 4;
