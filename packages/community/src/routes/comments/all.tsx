import { createFileRoute } from '@tanstack/react-router';
import AllComments from '../../pages/AllComments';
import { queryClient } from '~/lib/queryClient';
import { allCommentsQueryOptions } from '~/hooks/queries/useHomeQueries';

type AllCommentsSearch = {
  page?: number;
};

export const Route = createFileRoute('/comments/all')({
  validateSearch: (search: Record<string, unknown>): AllCommentsSearch => {
    return {
      page: Number(search.page) || 1,
    };
  },
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: ({ deps: { page } }) =>
    queryClient.ensureQueryData(allCommentsQueryOptions(page || 1)),
  component: AllComments,
});
