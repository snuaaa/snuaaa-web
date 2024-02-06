import React from 'react';
import { Board } from 'types';

const defaultBoards: {
  boardsInfo: Board[];
  setBoardsInfo: (boards: Board[]) => void;
} = {
  boardsInfo: [],
  setBoardsInfo: () => {
    return;
  },
};

const BoardContext = React.createContext(defaultBoards);

export default BoardContext;
