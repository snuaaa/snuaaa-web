import { createFileRoute } from '@tanstack/react-router';
import UserPage from '../../pages/UserPage';

type UserPageSearch = {
  tab?: 'posts' | 'photos' | 'comments';
  page?: number;
};

export const Route = createFileRoute('/userpage/$uuid')({
  component: UserPage,
  validateSearch: (search: Record<string, unknown>): UserPageSearch => ({
    tab: (search.tab as UserPageSearch['tab']) || undefined,
    page: Number(search.page) || undefined,
  }),
});
