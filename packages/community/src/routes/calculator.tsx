import { createFileRoute } from '@tanstack/react-router';
import MightyCalculator from '../pages/MightyCalculator';

export const Route = createFileRoute('/calculator')({
  component: MightyCalculator,
});
