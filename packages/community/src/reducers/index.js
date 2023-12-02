import { combineReducers } from 'redux';

import authentication from './authentication';

const reducers = combineReducers({
  authentication: authentication
});

export default reducers;