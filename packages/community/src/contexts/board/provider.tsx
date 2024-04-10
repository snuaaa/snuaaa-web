import { PropsWithChildren, useCallback, useMemo } from 'react';
import BoardContext from './context';
import { useFetch } from 'hooks/useFetch';
import BoardService from 'services/BoardService';
import { useAuth } from 'contexts/auth';

export const BoardProvider = ({ children }: PropsWithChildren) => {
  const authContext = useAuth();

  const fetchFunction = useCallback(async () => {
    if (authContext.authInfo.isLoggedIn) {
      return BoardService.retrieveBoards();
    }
  }, [authContext.authInfo.isLoggedIn]);

  const { data = [] } = useFetch({
    fetch: fetchFunction,
  });

  const boardContextValue = useMemo(
    () => ({
      boardsInfo: data,
    }),
    [data],
  );

  return (
    <BoardContext.Provider value={boardContextValue}>
      {children}
    </BoardContext.Provider>
  );
};
