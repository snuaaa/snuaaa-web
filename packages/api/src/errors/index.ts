type AppErrorOptions = {
  /**
   * Legacy numeric code kept for clients that branch on it
   * (e.g. 1011–1014 for password changes).
   */
  code?: number;
};

/**
 * Base class for expected errors that map to a 4xx response.
 * Anything thrown that is not an `AppError` is treated as a 500 and reported
 * to Sentry by the error handler.
 */
export class AppError extends Error {
  readonly status: number;
  readonly error: string;
  readonly code?: number;

  constructor(
    status: number,
    error: string,
    message: string,
    options: AppErrorOptions = {},
  ) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.error = error;
    this.code = options.code;
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', options?: AppErrorOptions) {
    super(400, 'BAD_REQUEST', message, options);
  }
}

/** The request has no valid credentials (missing/invalid token, wrong password). */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required', options?: AppErrorOptions) {
    super(401, 'UNAUTHENTICATED', message, options);
  }
}

/** The user is authenticated but not allowed to do this. */
export class AuthorizationError extends AppError {
  constructor(message = 'Permission denied', options?: AppErrorOptions) {
    super(403, 'FORBIDDEN', message, options);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found', options?: AppErrorOptions) {
    super(404, 'NOT_FOUND', message, options);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', options?: AppErrorOptions) {
    super(409, 'CONFLICT', message, options);
  }
}
