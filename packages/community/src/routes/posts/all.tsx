import { createFileRoute } from '@tanstack/react-router';
import AllPosts from '../../pages/AllPosts';
import { queryClient } from '~/lib/queryClient';
import { allPostsQueryOptions } from '~/hooks/queries/useHomeQueries';

type AllPostsSearch = {
  page?: number;
};

export const Route = createFileRoute('/posts/all')({
  validateSearch: (search: Record<string, unknown>): AllPostsSearch => {
    return {
      page: Number(search.page) || 1,
    };
  },
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: ({ deps: { page } }) =>
    queryClient.ensureQueryData(allPostsQueryOptions(page || 1)),
  component: AllPosts,
});
