import { createFileRoute } from '@tanstack/react-router';
import DocumentPage from '../../pages/Document';
import { queryClient } from '~/lib/queryClient';
import { documentQueryOptions } from '~/hooks/queries/useDocuQueries';

export const Route = createFileRoute('/document/$doc_id')({
  loader: ({ params }) =>
    queryClient.ensureQueryData(documentQueryOptions(Number(params.doc_id))),
  component: DocumentPage,
});
