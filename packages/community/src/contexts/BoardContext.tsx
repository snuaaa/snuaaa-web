import React from 'react';
import { Board } from 'services/types';

const defaultBoards: {
  boardsInfo: Board[];
} = {
  boardsInfo: [],
};

const BoardContext = React.createContext(defaultBoards);

export default BoardContext;
