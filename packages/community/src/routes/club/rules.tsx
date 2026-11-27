import { createFileRoute } from '@tanstack/react-router';
import ClubRules from '~/pages/ClubRules';

export const Route = createFileRoute('/club/rules')({
  component: ClubRules,
});
