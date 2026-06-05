import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { rateLimitMiddleware } from "./middlewares/rate-limit.middleware.js";
import { securityHeadersMiddleware } from "./middlewares/security-headers.middleware.js";
import { healthRouter } from "./routes/health.routes.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(securityHeadersMiddleware);
  app.use(
    cors({
      origin: env.cors.origin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use("/api", rateLimitMiddleware());

  app.use("/health", healthRouter);
  app.use("/api", apiRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
