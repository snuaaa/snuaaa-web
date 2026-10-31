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
  beforeLoad: async ({ search }) => {
    const session = await loadSession();
    if (session) {
      throw redirect({ href: getSafeRedirect(search.redirect), replace: true });
    }
  },
  component: LogIn,
});
