import { createFileRoute } from '@tanstack/react-router';
import DocumentPage from '../../pages/Document';

export const Route = createFileRoute('/document/$doc_id')({
  component: DocumentPage,
});
