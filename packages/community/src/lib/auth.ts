import { queryClient } from '~/lib/queryClient';
import { getToken } from '~/utils/token';
import {
  authKeys,
  Session,
  sessionQueryOptions,
} from '~/hooks/queries/useAuthQueries';

export const PUBLIC_PATHS = ['/auth/login', '/auth/signup'];

// 라우트 beforeLoad에서 사용한다. 캐시가 신선하면(5분) 서버를 다시 부르지 않는다.
export async function loadSession(): Promise<Session | null> {
  const { queryKey } = sessionQueryOptions();
  const cached = queryClient.getQueryData(queryKey);
  // 다른 탭에서 로그인/로그아웃해 쿠키와 캐시가 어긋났으면 신선해도 다시 확인한다.
  const isOutOfSync = cached !== undefined && !!cached !== !!getToken();
  try {
    return await queryClient.fetchQuery({
      ...sessionQueryOptions(),
      ...(isOutOfSync && { staleTime: 0 }),
    });
  } catch (err) {
    // 재검증에 실패해도 이전에 확인된 세션이 있으면 그대로 사용한다.
    const cachedAfterError = queryClient.getQueryData(queryKey);
    if (cachedAfterError !== undefined) {
      return cachedAfterError;
    }
    throw err;
  }
}

// 외부 주소로 이동하지 않도록 같은 origin의 경로만 허용한다.
// 브라우저는 URL에서 탭·개행을 지우므로(`/\t/evil.com` → `//evil.com`)
// 문자열 검사 대신 실제로 파싱한 origin을 비교한다.
export function getSafeRedirect(redirect?: string) {
  if (!redirect || !redirect.startsWith('/')) {
    return '/';
  }
  const { origin } = window.location;
  const url = new URL(redirect, origin);
  if (url.origin !== origin) {
    return '/';
  }
  return url.pathname + url.search + url.hash;
}

// 세션 외의 캐시는 등급에 따라 보이는 데이터가 달라지므로 로그인/로그아웃 시 비운다.
export function removeNonSessionQueries() {
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== authKeys.all[0],
  });
}
