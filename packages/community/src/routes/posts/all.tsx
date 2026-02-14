import { createFileRoute } from '@tanstack/react-router';
import AllPosts from '../../pages/AllPosts';

type AllPostsSearch = {
  page?: number;
};

export const Route = createFileRoute('/posts/all')({
  validateSearch: (search: Record<string, unknown>): AllPostsSearch => {
    return {
      page: Number(search.page) || 1,
    };
  },
  component: AllPosts,
});
