import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Board } from '~/services/types';
import BoardService from '~/services/BoardService';
import { useAuth } from '~/contexts/auth';

// Custom hook to access the board context
export const useBoards = () => {
  const authContext = useAuth();

  const { data: boardsInfo = [] } = useQuery({
    queryKey: ['boards'],
    queryFn: () => BoardService.retrieveBoards(),
    enabled: authContext.authInfo.isLoggedIn,
    initialData: [],
  });

  const boards = useMemo(() => {
    const noticeBoards: Board[] = boardsInfo.filter(
      (board) => board.menu === 1,
    );
    const communityBoards: Board[] = boardsInfo.filter(
      (board) => board.menu === 2,
    );
    const officialBoards: Board[] = boardsInfo.filter(
      (board) => board.menu === 3,
    );
    const photoBoards: Board[] = boardsInfo.filter((board) => board.menu === 4);

    return {
      noticeBoards,
      communityBoards,
      officialBoards,
      photoBoards,
      boardsInfo,
    };
  }, [boardsInfo]);

  return boards;
};
