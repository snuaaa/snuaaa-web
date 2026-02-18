import { setToken, removeToken, getToken } from '~/utils/token';
import { AuthContext } from './context';
import AuthType from '~/types/AuthType';
import { User } from '~/services/types';
import { useCallback, useEffect, useState, PropsWithChildren } from 'react';
import { useRouter, useLocation, Navigate } from '@tanstack/react-router';
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

const PUBLIC_PAGES = ['/auth/login', '/auth/signup'];

const Provider = ({ children }: PropsWithChildren) => {
  const [authInfo, setAuthInfo] = useState<AuthType>(initialAuth);
  const [isReady, setIsReady] = useState<boolean>(false);
  const router = useRouter();
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
    const currentPath = location.pathname;

    // 이미 공개 페이지에 있으면 리다이렉트하지 않음
    if (PUBLIC_PAGES.includes(currentPath)) {
      setIsReady(true);
      return;
    }

    const accessToken = getToken();
    if (!accessToken) {
      //토큰이 없으면 logout
      router.navigate({
        to: '/auth/login',
        search: {
          redirect: currentPath,
        },
        replace: true,
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
        router.navigate({
          to: '/auth/login',
          search: {
            redirect: currentPath,
          },
          replace: true,
        });
        authLogout();
      }
    }
  }, [authLogin, router, location.pathname]);

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
    return <Navigate to="/auth/login" />;
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
