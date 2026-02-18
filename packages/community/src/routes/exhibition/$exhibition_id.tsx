import { createFileRoute } from '@tanstack/react-router';
import ExhibitionPage from '../../pages/Exhibition';
import { queryClient } from '~/lib/queryClient';
import { exhibitionQueryOptions } from '~/hooks/queries/useExhibitionQueries';

export const Route = createFileRoute('/exhibition/$exhibition_id')({
  loader: ({ params }) =>
    queryClient.ensureQueryData(
      exhibitionQueryOptions(Number(params.exhibition_id)),
    ),
  component: ExhibitionPage,
});
