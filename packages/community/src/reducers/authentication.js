import * as types from '../actions/ActionTypes';
import { setToken, removeToken } from 'utils/tokenManager';

const initialState = {
  isLoggedIn: false,
  user_id: '',
  nickname: '',
  level: 0,
  profile_path: '',
};

function authentication(state = initialState, action) {
    
  switch (action.type) {
  case types.AUTH_LOGIN:
    setToken(action.token, action.isAutoLogin);
    return {
      ...state,
      isLoggedIn: true,
      user_id: action.user_id,
      nickname: action.nickname,
      level: action.level,
      profile_path: action.profile_path
    };
  case types.AUTH_LOGOUT:
    removeToken();
    return {
      ...state,
      isLoggedIn: false,
      user_id: '',
      nickname: '',
      level: 0,
      profile_path: ''
    };
  case types.AUTH_GET_STATUS:
    return {
      ...state,
      isLoggedIn: true
    };
            
  default:
    return state;
  }
}

export default authentication;