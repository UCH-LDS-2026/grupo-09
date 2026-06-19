export function errorMiddleware(error, _request, response, _next) {
  const statusCode = error.statusCode ?? 500;

  response.status(statusCode).json({
    error: {
      message: statusCode === 500 ? "Internal server error" : error.message,
      statusCode,
    },
  });
}
