import { queryOptions, useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import AuthService from '~/services/AuthService';
import { User } from '~/services/types';
import { getToken, removeToken, setToken } from '~/utils/token';

export type Session = {
  user: User;
  autoLogin: boolean;
};

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

// Query options
// 로그인하지 않았거나 토큰이 만료(401)되면 null.
// 그 밖의 에러(네트워크, 500 등)는 로그아웃시키지 않고 그대로 던진다.
export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: authKeys.session(),
    queryFn: async (): Promise<Session | null> => {
      if (!getToken()) {
        return null;
      }
      try {
        const { token, userInfo, autoLogin } = await AuthService.checkToken();
        // 서버가 연장해 준 토큰으로 교체
        setToken(token, autoLogin);
        return { user: userInfo, autoLogin };
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 401) {
          removeToken();
          return null;
        }
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

// Hooks
export function useSession() {
  return useQuery(sessionQueryOptions());
}
