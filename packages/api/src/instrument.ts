// Sentry must be initialized before any other module (express, pg, ...) is
// imported so that its auto-instrumentation can hook into them.
// Keep this as the very first import in `main.ts`.
import 'dotenv/config';
import * as Sentry from '@sentry/node';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    integrations: [
      // Most routes catch errors themselves and only `console.error` them
      // before responding, so forward `console.error` calls to Sentry as well.
      Sentry.captureConsoleIntegration({ levels: ['error'] }),
    ],
  });
}
