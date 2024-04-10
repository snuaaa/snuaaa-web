import React from 'react';
import { Board } from 'services/types';

type BoardContextType = {
  boardsInfo: Board[];
};

const BoardContext = React.createContext<BoardContextType | null>(null);

export default BoardContext;
