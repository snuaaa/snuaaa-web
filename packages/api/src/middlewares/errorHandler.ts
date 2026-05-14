// error handler middleware
export function errorHandler(err, req, res) {
  console.error(JSON.stringify(err));
  res.status(err.status || 500).json({
    success: false,
    code: err.code,
  });
}
