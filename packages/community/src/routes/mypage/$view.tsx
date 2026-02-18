import { createFileRoute } from '@tanstack/react-router';
import MyPage from '../../pages/MyPage';

// type View = 'info' | 'profile';

type Tab = 'posts' | 'photos' | 'comments';

type MyPageSearch = {
  tab?: Tab;
  page?: number;
};

export const Route = createFileRoute('/mypage/$view')({
  component: MyPage,
  validateSearch: (search: Record<string, unknown>): MyPageSearch => ({
    tab: (search.tab as Tab) || undefined,
    page: Number(search.page) || undefined,
  }),
});
