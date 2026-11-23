import { createFileRoute } from '@tanstack/react-router';
import Officers from '../pages/Officers';

export const Route = createFileRoute('/officers')({
  component: Officers,
});
