// The same checks the old signup form ran; the API only checks the id's
// characters, so these are what keep the data tidy.
export const ID_PATTERN = /^[A-Za-z0-9]{4,12}$/;
export const PASSWORD_PATTERN =
  /^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9^()@$!%*#?&]{8,20}$/;
export const NAME_PATTERN = /^[가-힣]{2,6}$|^[A-Za-z ]{2,20}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MOBILE_PATTERN = /^[0-9]{2,4}-?[0-9]{3,4}-?[0-9]{4}$/;
export const SCHOOL_NO_PATTERN = /^[0-9]{2}$/;
/** 00AAA-000 or AAA00-000, as the API reads it. */
export const AAA_NO_PATTERN =
  /^[0-9]{2}[Aa]{3}-[0-9]{1,3}$|^[Aa]{3}[0-9]{2}-[0-9]{1,3}$/;

/** The nickname the API builds: the join year, then the name. */
export function nicknameFor(name: string, aaaNo: string) {
  if (/^[0-9]{2}[Aa]{3}-/.test(aaaNo)) return aaaNo.slice(0, 2) + name;
  if (/^[Aa]{3}[0-9]{2}-/.test(aaaNo)) return aaaNo.slice(3, 5) + name;
  return name;
}

/** A valid 가입번호 makes 해왕성 (8); anything else 명왕성 (9). */
export const gradeFor = (aaaNo: string) => (AAA_NO_PATTERN.test(aaaNo) ? 8 : 9);

export const GRADE_GUIDE: { grade: number; name: string; role: string }[] = [
  { grade: 1, name: '태양', role: '홈페이지 관리자' },
  { grade: 3, name: '지구', role: '홈페이지 운영진' },
  { grade: 4, name: '화성', role: '전 회장' },
  { grade: 5, name: '목성', role: '현 회장' },
  { grade: 6, name: '토성', role: '임원진 · 회원명단, 공지 작성' },
  { grade: 7, name: '천왕성', role: '정회원 / OB · 일지 작성' },
  { grade: 8, name: '해왕성', role: '신입생 · 대부분의 기능' },
  { grade: 9, name: '명왕성', role: '비회원 · 커뮤니티 일부 제한' },
];

// Full class names so Tailwind can find them.
export const GRADE_DOTS: Record<number, string> = {
  1: 'bg-grade-1',
  3: 'bg-grade-3',
  4: 'bg-grade-4',
  5: 'bg-grade-5',
  6: 'bg-grade-6',
  7: 'bg-grade-7',
  8: 'bg-grade-8',
  9: 'bg-grade-9',
};
