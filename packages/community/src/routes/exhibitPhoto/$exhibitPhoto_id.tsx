import { createFileRoute } from '@tanstack/react-router';
import ExhibitPhoto from '../../pages/ExhibitPhoto';

export const Route = createFileRoute('/exhibitPhoto/$exhibitPhoto_id')({
  component: ExhibitPhoto,
});
