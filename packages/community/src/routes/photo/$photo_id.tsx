import { createFileRoute } from '@tanstack/react-router';
import Photo from '../../pages/Photo';

export const Route = createFileRoute('/photo/$photo_id')({
  component: Photo,
});
