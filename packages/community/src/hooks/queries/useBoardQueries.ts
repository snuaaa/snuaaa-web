import { queryOptions, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import BoardService from '~/services/BoardService';
import { Board } from '~/services/types';

// Query keys
export const boardKeys = {
  all: ['boards'] as const,
  list: () => [...boardKeys.all, 'list'] as const,
};

// Query options
export const boardsQueryOptions = () =>
  queryOptions({
    queryKey: boardKeys.list(),
    queryFn: () => BoardService.retrieveBoards(),
  });

// Hooks
export function useBoardsQuery(enabled = true) {
  return useQuery({
    ...boardsQueryOptions(),
    enabled,
  });
}

/** Drop-in replacement for the old `useBoards()` from contexts/board */
export function useBoards(enabled = true) {
  const { data: boardsInfo = [] } = useBoardsQuery(enabled);

  return useMemo(() => {
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
}
