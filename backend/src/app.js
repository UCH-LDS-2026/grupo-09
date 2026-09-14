import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { rateLimitMiddleware } from "./middlewares/rate-limit.middleware.js";
import { securityHeadersMiddleware } from "./middlewares/security-headers.middleware.js";
import { healthRouter } from "./routes/health.routes.js";
import { apiRouter } from "./routes/index.js";

const allowedOrigins = env.cors.origin
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function resolveCorsOrigin(origin, callback) {
  if (!origin) {
    callback(null, true);
    return;
  }

  const isConfiguredOrigin = allowedOrigins.includes(origin);
  const isLocalDevOrigin =
    !env.isProduction && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

  callback(null, isConfiguredOrigin || isLocalDevOrigin);
}

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", env.http.trustProxy);

  app.use(securityHeadersMiddleware);
  app.use(
    cors({
      origin: resolveCorsOrigin,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    }),
  );
  app.use("/api", rateLimitMiddleware());
  app.use(express.json({ limit: "1mb" }));

  app.use("/health", healthRouter);
  app.use("/api", apiRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
