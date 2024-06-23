import Cookies from 'universal-cookie';
import { setApiAuth } from 'services';

const cookies = new Cookies();

export function getToken() {
  return cookies.get('token');
}

export function setToken(token: string, isAutoLogin: boolean) {
  let cookieOption;
  if (isAutoLogin) {
    cookieOption = {
      path: '/',
      maxAge: 1200000,
    };
  } else {
    cookieOption = {
      path: '/',
    };
  }
  cookies.set('token', token, cookieOption);
  setApiAuth(token);
}

export function removeToken() {
  cookies.remove('token', {
    path: '/',
  });
}
