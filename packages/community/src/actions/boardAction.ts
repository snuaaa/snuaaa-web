import BoardType from '../types/BoardType';

export const boardActionType = {
  SET_BOARD_INFO: 1,
  GET_BOARD_INFO: 2
};

export const setBoardInfo = (boards: BoardType[]) => ({
  type: boardActionType.SET_BOARD_INFO,
  boardInfo: boards
});

export const getBoardInfo = () => ({
  type: boardActionType.GET_BOARD_INFO
});
