import { createContext } from 'react';
import { User } from 'services/types';

export type Auth = {
  authInfo: {
    isLoggedIn: boolean;
    user: {
      user_id: number;
      nickname: string;
      grade: number;
      level: number;
      profile_path: string;
    };
  };
  authLogin?: (token: string, autoLogin: boolean, userInfo: User) => void;
  authLogout?: () => void;
};

const initialAuth: Auth = {
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
};

export const AuthContext = createContext(initialAuth);
