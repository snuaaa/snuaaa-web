import { createFileRoute } from '@tanstack/react-router';
import UiGallery from '~/pages/UiGallery';

export const Route = createFileRoute('/dev/ui')({
  component: UiGallery,
});
