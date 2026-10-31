import { Board } from '~/services/types';

/** Board groups in the switcher sheet and the desktop sidebar, by `menu`. */
export const BOARD_GROUPS = [
  { menu: 1, name: '공지' },
  { menu: 2, name: '일상' },
  { menu: 3, name: '기록' },
] as const;

export const canRead = (board: Board, grade: number) => grade <= board.lv_read;
export const canWrite = (board: Pick<Board, 'lv_write'>, grade: number) =>
  grade <= board.lv_write;

const DAY = 24 * 60 * 60 * 1000;

/** A post written in the last 24 hours gets the yellow dot. */
export const isNewPost = (createdAt: string) =>
  Date.now() - new Date(createdAt).getTime() < DAY;

const pad = (n: number) => String(n).padStart(2, '0');

/** 14:32 today, 어제, 9.24 this year, 24.9.24 before that. */
export function formatListDate(value: string) {
  const date = new Date(value);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();

  if (date.getTime() >= startOfToday) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  if (date.getTime() >= startOfToday - DAY) {
    return '어제';
  }
  const monthDay = `${date.getMonth() + 1}.${date.getDate()}`;
  return date.getFullYear() === now.getFullYear()
    ? monthDay
    : `${String(date.getFullYear()).slice(2)}.${monthDay}`;
}

/** CKEditor HTML to one line of plain text. */
export const plainText = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

/** The part of `text` around the first match of `keyword`, or null. */
export function findSnippet(text: string, keyword: string, radius = 40) {
  const index = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (index < 0) return null;
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + keyword.length + radius * 2);
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
}

/** 93대 for the 2026 fall semester: two generations a year since 1980. */
export function currentGeneration(today = new Date()) {
  const generation = 2 * (today.getFullYear() - 1980);
  return today.getMonth() > 5 ? generation + 1 : generation;
}
