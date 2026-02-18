import { createFileRoute } from '@tanstack/react-router';
import ExhibitionPage from '../../pages/Exhibition';

export const Route = createFileRoute('/exhibition/$exhibition_id')({
  component: ExhibitionPage,
});
