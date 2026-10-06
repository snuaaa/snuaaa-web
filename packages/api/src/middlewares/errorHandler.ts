import { ErrorRequestHandler } from 'express';
import { MulterError } from 'multer';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import * as Sentry from '@sentry/node';
import { AppError, BadRequestError, ConflictError } from '../errors';

/**
 * Maps known client errors to an `AppError`.
 * Returns `null` for anything unexpected, which is answered with a 500.
 */
function toAppError(err: unknown): AppError | null {
  if (err instanceof AppError) {
    return err;
  }
  // UniqueConstraintError extends ValidationError, so check it first.
  if (err instanceof UniqueConstraintError) {
    return new ConflictError('Resource already exists');
  }
  if (err instanceof ValidationError) {
    return new BadRequestError(err.errors.map((e) => e.message).join(', '));
  }
  if (err instanceof MulterError) {
    return new BadRequestError(err.message);
  }
  // Errors from body-parser and other http-errors based middlewares.
  const httpError = err as {
    status?: number;
    expose?: boolean;
    message?: string;
  };
  if (
    httpError?.expose &&
    typeof httpError.status === 'number' &&
    httpError.status >= 400 &&
    httpError.status < 500
  ) {
    return new AppError(httpError.status, 'BAD_REQUEST', httpError.message);
  }
  return null;
}

// error handler middleware
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const appError = toAppError(err);

  if (appError) {
    console.warn(
      `${req.method} ${req.originalUrl} ${appError.status} ${appError.message}`,
    );
    res.status(appError.status).json({
      success: false,
      error: appError.error,
      message: appError.message,
      code: appError.code,
    });
    return;
  }

  console.error(err);
  Sentry.captureException(err);
  res.status(500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
  });
};
