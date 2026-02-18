import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/exhibitPhoto/$exhibitPhoto_id')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/',
      search: { exhibitPhoto: Number(params.exhibitPhoto_id) },
    });
  },
});
