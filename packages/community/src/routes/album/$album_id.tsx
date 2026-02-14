import { createFileRoute } from '@tanstack/react-router';
import AlbumPage from '../../pages/Album';

export const Route = createFileRoute('/album/$album_id')({
  component: AlbumPage,
});
