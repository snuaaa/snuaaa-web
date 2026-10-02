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
      // Errors are reported from `middlewares/errorHandler.ts`, which knows
      // which ones are expected 4xx (`AppError`) and which are real 500s.
      Sentry.expressIntegration({ shouldHandleError: false }),
    ],
  });
}
