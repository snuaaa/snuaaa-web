/** Grade that may rent equipment (lower is more privileged). */
export const EQUIPMENT_GRADE = 7;

/** 추억 만들기, the album board shown on the home page. */
export const MEMORY_BOARD = 'brd31';
/** 별사진 */
export const ASTRO_PHOTO_BOARD = 'brd32';

/** 동아리 소개 lives on the club's public site, not in the community. */
export const CLUB_INTRO_URL = 'https://www.snuaaa.net';
/** 옛 홈페이지 (AAArchive), the read-only archive of the previous site. */
export const OLD_SITE_URL = 'https://archive.snuaaa.net';

/** 회원 관리 is for grade 6 and above, except 전회장 (4). */
export const canManageUsers = (grade: number) => grade <= 6 && grade !== 4;

/** Grades a member can hold. There is no grade 2. */
export const USER_GRADES = [1, 3, 4, 5, 6, 7, 8, 9];
/** The least privileged grade that may change others' grades (1–3). */
export const GRADE_MANAGER_GRADE = 3;
/** 현 회장 (목성) may change grades too, to appoint 임원진 (토성). */
const PRESIDENT_GRADE_FOR_GRADES = 5;

/** Whether a member of `grade` may change other members' grades: 1–3 and
 *  현 회장 (5), not 전 회장 (4). */
export const canChangeGrades = (grade: number) =>
  grade <= GRADE_MANAGER_GRADE || grade === PRESIDENT_GRADE_FOR_GRADES;

/**
 * Whether `actor` may change a member's grade: grade 1–3 or 현 회장, and
 * only for members with a lower grade (a larger number) than their own. The
 * API (`PATCH user/:uuid/grade`) checks the same rules.
 */
export const canChangeGrade = (actor: number, target: number) =>
  canChangeGrades(actor) && target > actor;

/** The grades `actor` may give: only ones lower than their own. */
export const assignableGrades = (actor: number) =>
  canChangeGrades(actor) ? USER_GRADES.filter((g) => g > actor) : [];
