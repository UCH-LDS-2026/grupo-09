import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DEFAULT_DEV_SESSION_SECRET = "softwareestres-dev-session-secret-change-in-production";

config({ path: resolve(backendRoot, ".env"), quiet: true });

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const nodeEnv = process.env.NODE_ENV ?? "development";
const isProduction = nodeEnv === "production";
const sessionSecret = process.env.SESSION_SECRET ?? DEFAULT_DEV_SESSION_SECRET;
const corsOrigin = process.env.CORS_ORIGIN ?? (isProduction ? "" : "http://localhost:8080");
const dbUser = process.env.DB_USER ?? "root";
const dbPassword = process.env.DB_PASSWORD ?? "";

function requireProductionSafeConfig() {
  if (!isProduction) return;

  const errors = [];

  if (!process.env.SESSION_SECRET || sessionSecret === DEFAULT_DEV_SESSION_SECRET) {
    errors.push("SESSION_SECRET debe estar definido con un valor privado en producción.");
  }

  if (sessionSecret.length < 32) {
    errors.push("SESSION_SECRET debe tener al menos 32 caracteres en producción.");
  }

  if (!process.env.CORS_ORIGIN || !corsOrigin.trim()) {
    errors.push("CORS_ORIGIN debe declarar orígenes explícitos en producción.");
  }

  if (corsOrigin.split(",").some((origin) => origin.trim() === "*")) {
    errors.push("CORS_ORIGIN no puede usar '*' en producción.");
  }

  if (dbUser === "root") {
    errors.push("DB_USER no debe ser root en producción.");
  }

  if (!dbPassword) {
    errors.push("DB_PASSWORD debe estar definido en producción.");
  }

  if (errors.length) {
    throw new Error(`Configuración insegura de producción:\n- ${errors.join("\n- ")}`);
  }
}

requireProductionSafeConfig();

export const env = {
  nodeEnv,
  isProduction,
  api: {
    port: toNumber(process.env.API_PORT, 3001),
  },
  cors: {
    origin: corsOrigin,
  },
  auth: {
    sessionSecret,
    cookieName: process.env.SESSION_COOKIE_NAME ?? "softwareestres_session",
    cookieSecure: isProduction
      ? process.env.SESSION_COOKIE_SECURE !== "false"
      : process.env.SESSION_COOKIE_SECURE === "true",
  },
  db: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: toNumber(process.env.DB_PORT, 3306),
    name: process.env.DB_NAME ?? "softwareestres",
    user: dbUser,
    password: dbPassword,
  },
};
