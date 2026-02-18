import { createFileRoute } from '@tanstack/react-router';
import Post from '../../pages/Post';

export const Route = createFileRoute('/post/$post_id')({
  component: Post,
});
