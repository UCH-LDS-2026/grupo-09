import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

import { getDatabasePool } from "../config/database.js";
import { env } from "../config/env.js";

const HASH_ALGORITHM = "sha256";
const HASH_ITERATIONS = 100_000;
const HASH_KEY_LENGTH = 32;

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeEmail(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function normalizeName(value) {
  return String(value ?? "").trim();
}

function assertEmail(email) {
  if (!email || !email.includes("@")) {
    throw createHttpError(400, "Ingresá un email válido.");
  }
}

function assertPassword(password) {
  if (String(password ?? "").length < 6) {
    throw createHttpError(400, "La contraseña debe tener al menos 6 caracteres.");
  }
}

export function validateRegistrationPayload(payload = {}) {
  const name = normalizeName(payload.name);
  const email = normalizeEmail(payload.email);
  const password = String(payload.password ?? "");

  if (!name) {
    throw createHttpError(400, "Ingresá tu nombre.");
  }

  assertEmail(email);
  assertPassword(password);

  return {
    name: name.slice(0, 120),
    email,
    password,
  };
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(
    password,
    salt,
    HASH_ITERATIONS,
    HASH_KEY_LENGTH,
    HASH_ALGORITHM,
  ).toString("hex");

  return `pbkdf2:${HASH_ALGORITHM}:${HASH_ITERATIONS}:${salt}:${hash}`;
}

function verifyPassword(password, passwordHash) {
  const [method, algorithm, iterations, salt, storedHash] = String(passwordHash ?? "").split(":");

  if (method !== "pbkdf2" || !algorithm || !iterations || !salt || !storedHash) {
    return false;
  }

  const calculatedHash = pbkdf2Sync(
    password,
    salt,
    Number(iterations),
    Buffer.from(storedHash, "hex").length,
    algorithm,
  );
  const storedBuffer = Buffer.from(storedHash, "hex");

  return (
    storedBuffer.length === calculatedHash.length && timingSafeEqual(storedBuffer, calculatedHash)
  );
}

function mapUser(row) {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    role: row.role,
  };
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value) {
  return createHmac("sha256", env.auth.sessionSecret).update(value).digest("base64url");
}

function createSession(user) {
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
    }),
  );

  return {
    user,
    token: `ses.${payload}.${sign(payload)}`,
  };
}

function parseToken(token) {
  const [prefix, payload, signature] = String(token ?? "").split(".");

  if (prefix !== "ses" || !payload || !signature || sign(payload) !== signature) {
    throw createHttpError(401, "Sesión inválida o vencida.");
  }

  try {
    return JSON.parse(base64UrlDecode(payload));
  } catch {
    throw createHttpError(401, "Sesión inválida o vencida.");
  }
}

export const authService = {
  async register(payload = {}) {
    const pool = getDatabasePool();
    const { name, email, password } = validateRegistrationPayload(payload);

    try {
      const [result] = await pool.execute(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
        [name, email, hashPassword(password), "architect"],
      );

      return createSession({
        id: String(result.insertId),
        name,
        email,
        role: "architect",
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw createHttpError(409, "Ese email ya está registrado.");
      }

      throw error;
    }
  },

  async login(payload = {}) {
    const pool = getDatabasePool();
    const email = normalizeEmail(payload.email);
    const password = String(payload.password ?? "");

    assertEmail(email);
    assertPassword(password);

    const [rows] = await pool.execute(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1",
      [email],
    );
    const user = rows[0];

    if (!user || !verifyPassword(password, user.password_hash)) {
      throw createHttpError(401, "Correo o contraseña incorrectos.");
    }

    return createSession(mapUser(user));
  },

  async authenticateToken(token) {
    const payload = parseToken(token);
    const userId = Number(payload.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      throw createHttpError(401, "Sesión inválida o vencida.");
    }

    const pool = getDatabasePool();
    const [rows] = await pool.execute(
      "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
      [userId],
    );
    const user = rows[0];

    if (!user) {
      throw createHttpError(401, "Sesión inválida o vencida.");
    }

    return mapUser(user);
  },
};
