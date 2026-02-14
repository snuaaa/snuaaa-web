import { createFileRoute } from '@tanstack/react-router';
import SignUp from '../../pages/SignUp';

export const Route = createFileRoute('/auth/signup')({
  component: SignUp,
});
