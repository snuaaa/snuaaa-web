import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import * as Sentry from '@sentry/node';
import { AppError, BadRequestError, ConflictError } from '../errors';

/** Postgres error codes that are the client's fault. */
const POSTGRES_UNIQUE_VIOLATION = '23505';

/** The Postgres error behind a Drizzle query error, if any. */
function postgresErrorCode(error: unknown): string | undefined {
  for (
    let current = error;
    current;
    current = (current as { cause?: unknown }).cause
  ) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === 'string') {
      return code;
    }
  }
  return undefined;
}

/**
 * Maps known client errors to an `AppError`. Returns `null` for anything
 * unexpected.
 */
function toAppError(error: unknown): AppError | null {
  if (error instanceof AppError) {
    return error;
  }
  if (error instanceof HTTPException && error.status < 500) {
    // e.g. a malformed JSON body.
    return new AppError(error.status, 'BAD_REQUEST', error.message);
  }
  if (postgresErrorCode(error) === POSTGRES_UNIQUE_VIOLATION) {
    return new ConflictError('Resource already exists');
  }
  return null;
}

/**
 * Answers every error in the `{ success: false, error, message, code? }`
 * format the web reads. Only unexpected errors become a 500 and go to Sentry.
 */
export const onError: ErrorHandler = (error, context) => {
  const appError = toAppError(error);

  if (appError) {
    console.warn(
      `${context.req.method} ${context.req.path} ${appError.status} ${appError.message}`,
    );
    return context.json(
      {
        success: false,
        error: appError.error,
        message: appError.message,
        code: appError.code,
      },
      appError.status as 400,
    );
  }

  console.error(error);
  Sentry.captureException(error);
  return context.json(
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
      .map(
        (issue) =>
          (issue.path.length ? `${issue.path.join('.')}: ` : '') +
          issue.message,
      )
      .join(', ');
    throw new BadRequestError(message || 'Invalid request');
  }
}
