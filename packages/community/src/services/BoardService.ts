import { Board } from './types';
import { API } from './index';
import { AxiosPromise } from 'axios';

const BoardService = {
  retrieveBoards: function (): AxiosPromise<Board[]> {
    return API.get('board');
  },

  retrieveBoardInfo: function (board_id: string): AxiosPromise<{
    boardInfo: Board;
  }> {
    return API.get(`board/${board_id}`);
  },
};

export default BoardService;
