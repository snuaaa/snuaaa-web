import { AaaService } from './index';

const AuthService = {

  checkToken : function () {
    return AaaService.get('auth/check');
  },

  signUp: function (data: any) {
    return AaaService.post('auth/signup/', data);
  },

  duplicateCheck: function (data: any) {
    return AaaService.post('auth/signup/dupcheck', data);
  },

  logIn: function (data: any) {
    return AaaService.post('auth/login/', data);
  },

  guestLogIn: function () {
    return AaaService.get('auth/login/guest');
  }
};

export default AuthService;
