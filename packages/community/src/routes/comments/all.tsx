import { createFileRoute } from '@tanstack/react-router';
import AllComments from '../../pages/AllComments';

type AllCommentsSearch = {
  page?: number;
};

export const Route = createFileRoute('/comments/all')({
  validateSearch: (search: Record<string, unknown>): AllCommentsSearch => {
    return {
      page: Number(search.page) || 1,
    };
  },
  component: AllComments,
});
