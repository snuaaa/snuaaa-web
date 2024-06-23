import { API } from './index';
import { User } from './types';

export interface SingUpRequest {
  id: string;
  password: string;
  passwordCf: string;
  aaaNum: string;
  username: string;
  col_no: string;
  major: string;
  email: string;
  mobile: string;
  introduction: string;
  profile: File;
}

export interface DuplicateCheckRequest {
  check_id: string;
}

export interface LogInRequest {
  id: string;
  password: string;
}

export interface Auth {
  userInfo: User;
  autoLogin: boolean;
  token: string;
}

type GuestUser = Pick<
  User,
  'user_id' | 'grade' | 'level' | 'profile_path' | 'nickname'
>;

type CheckTokenResponse = Auth;

type LogInResponse = Auth;

type GuestLogInResponse = {
  userInfo: GuestUser;
  autoLogin: false;
  token: string;
};

const AuthService = {
  checkToken: function () {
    return API.get<CheckTokenResponse>('auth/check');
  },

  signUp: function (data: SingUpRequest) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      formData.append(key, value);
    }

    return API.post('auth/signup/', formData);
  },

  duplicateCheck: function (data: DuplicateCheckRequest) {
    return API.post('auth/signup/dupcheck', data);
  },

  logIn: function (data: LogInRequest) {
    return API.post<LogInResponse>('auth/login/', data);
  },

  guestLogIn: function () {
    return API.get<GuestLogInResponse>('auth/login/guest');
  },
};

export default AuthService;
