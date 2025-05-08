import { useContext, useMemo } from 'react';
import BoardContext from './context';
import { Board } from '~/services/types';

// Custom hook to access the board context
export const useBoards = () => {
  const context = useContext(BoardContext);

  if (!context) {
    throw new Error('useBoards must be used within a BoardProvider');
  }

  const boards = useMemo(() => {
    const noticeBoards: Board[] = context.boardsInfo.filter(
      (board) => board.menu === 1,
    );
    const communityBoards: Board[] = context.boardsInfo.filter(
      (board) => board.menu === 2,
    );
    const officialBoards: Board[] = context.boardsInfo.filter(
      (board) => board.menu === 3,
    );
    const photoBoards: Board[] = context.boardsInfo.filter(
      (board) => board.menu === 4,
    );

    return {
      noticeBoards,
      communityBoards,
      officialBoards,
      photoBoards,
      boardsInfo: context.boardsInfo,
    };
  }, [context.boardsInfo]);

  return boards;
};
