import { setToken, removeToken, getToken } from '~/utils/token';
import { AuthContext } from './context';
import AuthType from '~/types/AuthType';
import { User } from '~/services/types';
import { useCallback, useEffect, useState, PropsWithChildren } from 'react';
import { Redirect, useHistory, useLocation } from 'react-router-dom';
import AuthService from '~/services/AuthService';
import Loading from '~/components/Common/Loading';

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

const Provider = ({ children }: PropsWithChildren) => {
  const [authInfo, setAuthInfo] = useState<AuthType>(initialAuth);
  const [isReady, setIsReady] = useState<boolean>(false);
  const history = useHistory();
  const location = useLocation();

  const authLogin = useCallback(
    (token: string, autoLogin: boolean, userInfo: User) => {
      setToken(token, autoLogin);
      setAuthInfo({
        isLoggedIn: true,
        user: userInfo,
      });
      setIsReady(true);
    },
    [],
  );

  const authLogout = () => {
    removeToken();
    setAuthInfo(initialAuth);
    setIsReady(true);
  };

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
    checkToken();
  }, [checkToken]);

  if (!isReady) {
    return <Loading />;
  }

  if (
    !authInfo.isLoggedIn &&
    !['/auth/login', '/auth/signup'].includes(location.pathname)
  ) {
    return <Redirect to="/auth/login" />;
  }

  return (
    <AuthContext.Provider
      value={{
        authInfo: authInfo,
        authLogin: authLogin,
        authLogout: authLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default Provider;
