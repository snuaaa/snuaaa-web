import { createFileRoute, redirect } from '@tanstack/react-router';
import LogIn from '../../pages/LogIn';
import { getSafeRedirect, loadSession } from '~/lib/auth';

type LoginSearch = {
  redirect?: string;
};

export const Route = createFileRoute('/auth/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    return {
      redirect: (search.redirect as string) || undefined,
    };
  },
  // 이미 로그인한 사용자는 원래 가려던 페이지로 보낸다.
  // 세션 확인이 실패(500, 네트워크 오류)해도 로그인 폼은 보여준다.
  beforeLoad: async ({ search }) => {
    const session = await loadSession().catch(() => null);
    if (session) {
      throw redirect({ href: getSafeRedirect(search.redirect), replace: true });
    }
  },
  component: LogIn,
});
