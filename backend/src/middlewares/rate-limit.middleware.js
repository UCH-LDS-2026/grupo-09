const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 180;
const LOGIN_WINDOW_MS = 10 * 60_000;
const LOGIN_MAX_ATTEMPTS = 12;
const REGISTER_WINDOW_MS = 10 * 60_000;
const REGISTER_MAX_ATTEMPTS = 6;
const MAX_BUCKETS_PER_STORE = 10_000;
const buckets = new Map();
const loginBuckets = new Map();
const registerBuckets = new Map();

function normalizeEmail(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function consumeBucket(store, key, windowMs, maxRequests) {
  const now = Date.now();

  if (store.size > MAX_BUCKETS_PER_STORE) {
    pruneExpiredBuckets(store, now);
  }

  const bucket = store.get(key);

  if (!bucket || now > bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  bucket.count += 1;

  return {
    allowed: bucket.count <= maxRequests,
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

function pruneExpiredBuckets(store, now = Date.now()) {
  for (const [key, bucket] of store.entries()) {
    if (now > bucket.resetAt) {
      store.delete(key);
    }
  }
}

function rejectTooManyRequests(response, retryAfterSeconds) {
  response.setHeader("Retry-After", String(retryAfterSeconds));
  response.status(429).json({
    error: {
      message: "Demasiadas solicitudes. Esperá un momento e intentá de nuevo.",
      statusCode: 429,
    },
  });
}

export function rateLimitMiddleware(
  windowMs = DEFAULT_WINDOW_MS,
  maxRequests = DEFAULT_MAX_REQUESTS,
) {
  return (request, response, next) => {
    const key = request.ip ?? request.socket.remoteAddress ?? "unknown";
    const result = consumeBucket(buckets, key, windowMs, maxRequests);

    if (!result.allowed) {
      rejectTooManyRequests(response, result.retryAfterSeconds);
      return;
    }

    next();
  };
}

export function loginRateLimitMiddleware(
  windowMs = LOGIN_WINDOW_MS,
  maxAttempts = LOGIN_MAX_ATTEMPTS,
) {
  return (request, response, next) => {
    const ip = request.ip ?? request.socket.remoteAddress ?? "unknown";
    const email = normalizeEmail(request.body?.email) || "sin-email";
    const result = consumeBucket(loginBuckets, `${ip}:${email}`, windowMs, maxAttempts);

    if (!result.allowed) {
      rejectTooManyRequests(response, result.retryAfterSeconds);
      return;
    }

    next();
  };
}

export function registerRateLimitMiddleware(
  windowMs = REGISTER_WINDOW_MS,
  maxAttempts = REGISTER_MAX_ATTEMPTS,
) {
  return (request, response, next) => {
    const ip = request.ip ?? request.socket.remoteAddress ?? "unknown";
    const email = normalizeEmail(request.body?.email) || "sin-email";
    const result = consumeBucket(registerBuckets, `${ip}:${email}`, windowMs, maxAttempts);

    if (!result.allowed) {
      rejectTooManyRequests(response, result.retryAfterSeconds);
      return;
    }

    next();
  };
}

setInterval(() => {
  pruneExpiredBuckets(buckets);
  pruneExpiredBuckets(loginBuckets);
  pruneExpiredBuckets(registerBuckets);
}, DEFAULT_WINDOW_MS).unref();
