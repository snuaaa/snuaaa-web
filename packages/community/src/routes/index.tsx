import { createFileRoute } from '@tanstack/react-router';
import Home from '../pages/Home';
import { queryClient } from '~/lib/queryClient';
import { homeDataQueryOptions } from '~/hooks/queries/useHomeQueries';

export const Route = createFileRoute('/')({
  loader: () => queryClient.ensureQueryData(homeDataQueryOptions()),
  component: Home,
});
