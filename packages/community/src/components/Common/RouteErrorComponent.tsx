import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import {
  ErrorComponent,
  useRouter,
  type ErrorComponentProps,
} from '@tanstack/react-router';
import { Button } from '~/components/ui';

// Errors caught by the router's error boundaries never reach the global
// handlers in production, so report them to Sentry explicitly.
export default function RouteErrorComponent(props: ErrorComponentProps) {
  const router = useRouter();

  useEffect(() => {
    Sentry.captureException(props.error);
  }, [props.error]);

  // Re-runs beforeLoad and loaders, e.g. after the API was briefly down.
  return (
    <div className="flex flex-col items-start gap-3 p-4">
      <ErrorComponent {...props} />
      <Button onClick={() => router.invalidate()}>다시 시도</Button>
    </div>
  );
}
