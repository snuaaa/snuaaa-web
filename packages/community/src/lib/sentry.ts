import * as Sentry from '@sentry/react';
import { SENTRY_DSN, SENTRY_ENVIRONMENT } from '~/constants/env';
import { router } from '~/router';

export function initSentry() {
  if (!SENTRY_DSN) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT || import.meta.env.MODE,
    integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router)],
    tracesSampleRate: 0.1,
  });
}
