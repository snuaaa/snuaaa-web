import { Board } from './types';
import { API } from './index';

const BoardService = {
  retrieveBoards: function () {
    return API.get<Board[]>('board');
  },

  retrieveBoardInfo: function (board_id: string) {
    return API.get<{
      boardInfo: Board;
    }>(`board/${board_id}`);
  },
};

export default BoardService;
