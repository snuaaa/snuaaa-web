// error handler middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err, req, res, _next) {
  console.error(JSON.stringify(err));
  res.status(err.status || 500).json({
    success: false,
    code: err.code,
  });
}
