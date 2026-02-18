import { createFileRoute } from '@tanstack/react-router';
import AlbumPage from '../../pages/Album';
import { queryClient } from '~/lib/queryClient';
import { albumQueryOptions } from '~/hooks/queries/useAlbumQueries';

export const Route = createFileRoute('/album/$album_id')({
  loader: ({ params }) =>
    queryClient.ensureQueryData(albumQueryOptions(Number(params.album_id))),
  component: AlbumPage,
});
