import { useEffect, useMemo } from 'react';
import { useLocation } from '@tanstack/react-router';
import { useBoards } from '~/hooks/queries/useBoardQueries';
import { useAuth } from '~/contexts/auth';

export type NavSection =
  'home' | 'about' | 'board' | 'photo' | 'equipment' | 'my';

const LAST_BOARD_KEY = 'aaa:lastBoard';
const LAST_PHOTO_BOARD_KEY = 'aaa:lastPhotoBoard';
/** 별사진, the photo tab's landing board until another is visited. */
const DEFAULT_PHOTO_BOARD = 'brd32';
const PHOTO_MENU = 4;

const readStorage = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage: the tab falls back to its default.
  }
};

const SECTION_PREFIXES: [string, NavSection][] = [
  ['/about', 'about'],
  ['/post', 'board'],
  ['/posts', 'board'],
  ['/comments', 'board'],
  ['/document', 'board'],
  ['/album', 'photo'],
  ['/photo', 'photo'],
  ['/exhibition', 'photo'],
  ['/equipment', 'equipment'],
  ['/mypage', 'my'],
  ['/userpage', 'my'],
];

/**
 * Which top-level section the current page belongs to, and where the 게시판
 * and 사진 entries lead: the board last visited in that section, else the
 * first notice board or 별사진.
 */
export function useNavSection() {
  const { pathname } = useLocation();
  const { boardsInfo, noticeBoards } = useBoards();
  const {
    authInfo: {
      user: { grade },
    },
  } = useAuth();

  const boardId = pathname.match(/^\/board\/([^/]+)/)?.[1];
  const board = boardsInfo.find((b) => b.board_id === boardId);

  let section: NavSection | null = null;
  if (pathname === '/') {
    section = 'home';
  } else if (boardId) {
    section = board?.menu === PHOTO_MENU ? 'photo' : 'board';
  } else {
    section =
      SECTION_PREFIXES.find(
        ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
      )?.[1] ?? null;
  }

  useEffect(() => {
    if (!board) return;
    writeStorage(
      board.menu === PHOTO_MENU ? LAST_PHOTO_BOARD_KEY : LAST_BOARD_KEY,
      board.board_id,
    );
  }, [board]);

  const destinations = useMemo(() => {
    const readable = (id: string | null) =>
      boardsInfo.some((b) => b.board_id === id && grade <= b.lv_read)
        ? id
        : null;
    // The board on screen wins: storage is written only after this render.
    const current = (photo: boolean) =>
      board && (board.menu === PHOTO_MENU) === photo ? board.board_id : null;

    return {
      board:
        current(false) ??
        readable(readStorage(LAST_BOARD_KEY)) ??
        noticeBoards.find((b) => grade <= b.lv_read)?.board_id ??
        'brd01',
      photo:
        current(true) ??
        readable(readStorage(LAST_PHOTO_BOARD_KEY)) ??
        DEFAULT_PHOTO_BOARD,
    };
  }, [boardsInfo, noticeBoards, grade, board]);

  return { section, destinations };
}
