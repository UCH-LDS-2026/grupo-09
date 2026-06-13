import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

config({ path: resolve(backendRoot, ".env"), quiet: true });

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const nodeEnv = process.env.NODE_ENV ?? "development";

export const env = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  api: {
    port: toNumber(process.env.API_PORT, 3001),
  },
  cors: {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:8080",
  },
  auth: {
    sessionSecret:
      process.env.SESSION_SECRET ?? "softwareestres-dev-session-secret-change-in-production",
  },
  db: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: toNumber(process.env.DB_PORT, 3306),
    name: process.env.DB_NAME ?? "softwareestres",
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
  },
};
