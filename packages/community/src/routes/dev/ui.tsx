import { createFileRoute } from '@tanstack/react-router';
import UiGallery from '~/pages/UiGallery';

// TEMPORARY: a public component gallery for checking the redesign on the
// preview, intentionally shipped in production builds and open without login.
// Delete this route, pages/UiGallery.tsx and its PUBLIC_PAGES entry before
// epic/redesign merges into main (tracked in #173 and docs/redesign.md).
export const Route = createFileRoute('/dev/ui')({
  component: UiGallery,
});
