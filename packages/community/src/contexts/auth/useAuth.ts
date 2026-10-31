import { useCallback, useMemo } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import AuthType from '~/types/AuthType';
import { User } from '~/services/types';
import { removeToken, setToken } from '~/utils/token';
import {
  Session,
  sessionQueryOptions,
  useSession,
} from '~/hooks/queries/useAuthQueries';
import { removeNonSessionQueries } from '~/lib/auth';

const loggedOutAuth: AuthType = {
  isLoggedIn: false,
  user: {
    user_id: 0,
    user_uuid: '',
    nickname: '',
    grade: 10,
    level: 0,
    profile_path: '',
  },
};

// 인증 여부에 따른 페이지 접근은 라우트의 beforeLoad(routes/__root.tsx)가 막는다.
// 이 훅은 현재 세션 정보와 로그인/로그아웃 동작만 제공한다.
const useAuth = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const authInfo = useMemo<AuthType>(
    () => (session ? { isLoggedIn: true, user: session.user } : loggedOutAuth),
    [session],
  );

  // 세션 캐시를 바로 갱신하므로 호출 직후 navigate해도 beforeLoad를 통과한다.
  const authLogin = useCallback(
    (token: string, autoLogin: boolean, userInfo: User) => {
      setToken(token, autoLogin);
      removeNonSessionQueries();
      const session: Session = { user: userInfo, autoLogin };
      queryClient.setQueryData(sessionQueryOptions().queryKey, session);
    },
    [queryClient],
  );

  const authLogout = useCallback(async () => {
    removeToken();
    queryClient.setQueryData(sessionQueryOptions().queryKey, null);
    await router.navigate({ to: '/auth/login' });
    removeNonSessionQueries();
  }, [queryClient, router]);

  return { authInfo, authLogin, authLogout };
};

export default useAuth;
