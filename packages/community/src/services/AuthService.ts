import { API } from './index';

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

const AuthService = {
  checkToken: function () {
    return API.get('auth/check');
  },

  signUp: function (data: SingUpRequest) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      formData.append(key, value);
    }

    return API.post('auth/signup/', data);
  },

  duplicateCheck: function (data: DuplicateCheckRequest) {
    return API.post('auth/signup/dupcheck', data);
  },

  logIn: function (data: LogInRequest) {
    return API.post('auth/login/', data);
  },

  guestLogIn: function () {
    return API.get('auth/login/guest');
  },
};

export default AuthService;
