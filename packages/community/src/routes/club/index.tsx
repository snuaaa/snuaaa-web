import { createFileRoute } from '@tanstack/react-router';
import Club from '~/pages/Club';

export const Route = createFileRoute('/club/')({
  component: Club,
});
