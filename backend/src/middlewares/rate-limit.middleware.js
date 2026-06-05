const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 180;
const buckets = new Map();

export function rateLimitMiddleware(
  windowMs = DEFAULT_WINDOW_MS,
  maxRequests = DEFAULT_MAX_REQUESTS,
) {
  return (request, response, next) => {
    const key = request.ip ?? request.socket.remoteAddress ?? "unknown";
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now > bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    bucket.count += 1;

    if (bucket.count > maxRequests) {
      response.status(429).json({
        error: {
          message: "Demasiadas solicitudes. Esperá un momento e intentá de nuevo.",
          statusCode: 429,
        },
      });
      return;
    }

    next();
  };
}
