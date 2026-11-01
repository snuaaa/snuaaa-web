import { queryClient } from '~/lib/queryClient';
import {
  authKeys,
  Session,
  sessionQueryOptions,
} from '~/hooks/queries/useAuthQueries';

export const PUBLIC_PATHS = ['/auth/login', '/auth/signup'];

// 라우트 beforeLoad에서 사용한다. 캐시가 신선하면(5분) 서버를 다시 부르지 않는다.
export async function loadSession(): Promise<Session | null> {
  try {
    return await queryClient.fetchQuery(sessionQueryOptions());
  } catch (err) {
    // 재검증에 실패해도 이전에 확인된 세션이 있으면 그대로 사용한다.
    const cached = queryClient.getQueryData(sessionQueryOptions().queryKey);
    if (cached !== undefined) {
      return cached;
    }
    throw err;
  }
}

// 외부 주소로 이동하지 않도록 내부 경로만 허용한다.
export function getSafeRedirect(redirect?: string) {
  if (redirect && redirect.startsWith('/') && !/^\/[/\\]/.test(redirect)) {
    return redirect;
  }
  return '/';
}

// 세션 외의 캐시는 등급에 따라 보이는 데이터가 달라지므로 로그인/로그아웃 시 비운다.
export function removeNonSessionQueries() {
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== authKeys.all[0],
  });
}
