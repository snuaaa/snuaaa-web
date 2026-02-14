import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/photo/$photo_id')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/',
      search: { photo: Number(params.photo_id) },
    });
  },
});
