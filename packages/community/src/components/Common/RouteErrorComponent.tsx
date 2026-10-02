import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import {
  ErrorComponent,
  type ErrorComponentProps,
} from '@tanstack/react-router';

// Errors caught by the router's error boundaries never reach the global
// handlers in production, so report them to Sentry explicitly.
export default function RouteErrorComponent(props: ErrorComponentProps) {
  useEffect(() => {
    Sentry.captureException(props.error);
  }, [props.error]);

  return <ErrorComponent {...props} />;
}
