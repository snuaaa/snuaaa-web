import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import * as Sentry from '@sentry/node';
import { AppError, BadRequestError, ConflictError } from '../errors';

/** Postgres error codes that are the client's fault. */
const PG_UNIQUE_VIOLATION = '23505';

/** The Postgres error behind a Drizzle query error, if any. */
function pgCode(err: unknown): string | undefined {
  for (let e = err; e; e = (e as { cause?: unknown }).cause) {
    const code = (e as { code?: unknown }).code;
    if (typeof code === 'string') {
      return code;
    }
  }
  return undefined;
}

/**
 * Maps known client errors to an `AppError`, like the Express error handler
 * (`middlewares/errorHandler.ts`). Returns `null` for anything unexpected.
 */
function toAppError(err: unknown): AppError | null {
  if (err instanceof AppError) {
    return err;
  }
  if (err instanceof HTTPException && err.status < 500) {
    // e.g. a malformed JSON body.
    return new AppError(err.status, 'BAD_REQUEST', err.message);
  }
  if (pgCode(err) === PG_UNIQUE_VIOLATION) {
    return new ConflictError('Resource already exists');
  }
  return null;
}

/**
 * Answers in the same `{ success: false, error, message, code? }` format as
 * Express. Only unexpected errors become a 500 and go to Sentry.
 */
export const onError: ErrorHandler = (err, c) => {
  const appError = toAppError(err);

  if (appError) {
    console.warn(
      `${c.req.method} ${c.req.path} ${appError.status} ${appError.message}`,
    );
    return c.json(
      {
        success: false,
        error: appError.error,
        message: appError.message,
        code: appError.code,
      },
      appError.status as 400,
    );
  }

  console.error(err);
  Sentry.captureException(err);
  return c.json(
    {
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    },
    500,
  );
};

/** zod validation hook: a 400 in the shared format instead of zod's body. */
export function validationHook(result: {
  success: boolean;
  error?: { issues: { path: PropertyKey[]; message: string }[] };
}) {
  if (!result.success) {
    const message = (result.error?.issues ?? [])
      .map((i) => (i.path.length ? `${i.path.join('.')}: ` : '') + i.message)
      .join(', ');
    throw new BadRequestError(message || 'Invalid request');
  }
}
