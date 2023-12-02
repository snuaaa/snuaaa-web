
import { boardActionType } from '../actions/boardAction';

const initialState = {
  boardInfo: [],
};

function boardReducer(state = initialState, action: any) {
    
  switch (action.type) {
  case boardActionType.SET_BOARD_INFO:
    return {
      boardInfo: action.boardInfo
    };
  case boardActionType.GET_BOARD_INFO:
    return state;
            
  default:
    return state;
  }
}

export default boardReducer;