import { createFileRoute } from '@tanstack/react-router';
import LogIn from '../../pages/LogIn';

type LoginSearch = {
  redirect?: string;
};

export const Route = createFileRoute('/auth/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    return {
      redirect: (search.redirect as string) || undefined,
    };
  },
  component: LogIn,
});
