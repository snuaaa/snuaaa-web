import React from 'react';
import { User } from 'services/types';

const initialAuth = {
  authInfo: {
    isLoggedIn: false,
    user: {
      user_id: 0,
      nickname: '',
      grade: 10,
      level: 0,
      profile_path: '',
    },
  },
  authLogin: (token: string, autoLogin: boolean, userInfo: User) => {
    console.log(token);
  },
  authLogout: () => {
    return;
  },
};

const AuthContext = React.createContext(initialAuth);

export default AuthContext;
