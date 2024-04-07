import React, { useState, useEffect, useCallback } from 'react';
import { Redirect, useHistory, useLocation } from 'react-router';

import './App.scss';

import Router from './router';
import Loading from './components/Common/Loading';
import { getToken, setToken, removeToken } from './utils/token';
import AuthService from './services/AuthService';
import AuthContext from './contexts/AuthContext';
import AuthType from './types/AuthType';
import { User } from 'services/types';

const initialAuth: AuthType = {
  isLoggedIn: false,
  user: {
    user_id: 0,
    nickname: '',
    grade: 10,
    level: 0,
    profile_path: '',
  },
};

function App() {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [authInfo, setAuthinfo] = useState<AuthType>(initialAuth);
  const history = useHistory();
  const location = useLocation();

  const authLogin = useCallback(
    (token: string, autoLogin: boolean, userInfo: User) => {
      setToken(token, autoLogin);
      setAuthinfo({
        isLoggedIn: true,
        user: userInfo,
      });
      setIsReady(true);
    },
    [],
  );

  const checkToken = useCallback(async () => {
    const accessToken = getToken();
    if (!accessToken) {
      //토큰이 없으면 logout
      history.replace({
        pathname: '/auth/login',
        state: {
          accessLocation: history.location,
        },
      });
      authLogout();
      setIsReady(true);
    } else {
      // 서버에 토큰 확인 , invalid => logout, valid => 로그인 유지(연장)
      try {
        const { token, userInfo, autoLogin } = await AuthService.checkToken();
        authLogin(token, autoLogin, userInfo);
      } catch (err) {
        // TODO: 401의 경우에만 로그아웃
        console.error(err);
        history.replace({
          pathname: '/auth/login',
          state: {
            accessLocation: history.location,
          },
        });
        authLogout();
      }
    }
  }, [authLogin, history]);

  useEffect(() => {
    if (navigator.userAgent.toLowerCase().indexOf('msie') !== -1) {
      alert(
        'MicroSoft Internet Explorer에서는 홈페이지가 정상 동작하지 않을 수 있습니다.',
      );
    } else if (
      navigator.appName === 'Netscape' &&
      navigator.userAgent.search('Trident') !== -1
    ) {
      alert(
        'MicroSoft Internet Explorer에서는 홈페이지가 정상 동작하지 않을 수 있습니다.',
      );
    }
    checkToken();
  }, [checkToken]);

  const authLogout = () => {
    removeToken();
    setAuthinfo(initialAuth);
    setIsReady(true);
  };

  return (
    <div className="snuaaa-wrapper">
      <AuthContext.Provider
        value={{
          authInfo: authInfo,
          authLogin: authLogin,
          authLogout: authLogout,
        }}
      >
        {(() => {
          if (!isReady) {
            return <Loading />;
          } else if (
            !authInfo.isLoggedIn &&
            !(
              location.pathname === '/auth/login' ||
              location.pathname === '/auth/signup'
            )
          ) {
            return <Redirect to="/auth/login" />;
          } else {
            return <Router />;
          }
        })()}
      </AuthContext.Provider>
    </div>
  );
}

export default App;
