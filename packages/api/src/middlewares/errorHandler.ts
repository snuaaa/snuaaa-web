// error handler middleware
export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) {
    // Reported to Sentry through `captureConsoleIntegration`.
    console.error(err);
  } else {
    console.warn(JSON.stringify(err));
  }
  res.status(status).json({
    success: false,
    code: err.code,
  });
}
