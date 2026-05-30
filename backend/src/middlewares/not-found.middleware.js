export function notFoundMiddleware(request, _response, next) {
  const error = new Error(`Route ${request.method} ${request.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
}
