import Cookies from 'universal-cookie';
import axios from 'axios';

const cookies = new Cookies();

export function getToken() {
  return cookies.get('token');
}

export function setToken(token, isAutoLogin) {
  let cookieOption;
  if (isAutoLogin) {
    cookieOption = {
      path: '/',
      maxAge: 1200000
    };
  }
  else {
    cookieOption = {
      path: '/'
    };
  }
  cookies.set('token', token, cookieOption);
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
}

export function removeToken() {
  cookies.remove('token', {
    path: '/'
  });
}