import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

import { getDatabasePool } from "../config/database.js";
import { env } from "../config/env.js";

const HASH_ALGORITHM = "sha256";
const HASH_ITERATIONS = 100_000;
const HASH_KEY_LENGTH = 32;
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const ROL_PREDETERMINADO = "arquitecto";

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
  const name = normalizeName(payload.nombre);
  const email = normalizeEmail(payload.email);
  const password = String(payload.contrasena ?? "");

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
    nombre: row.nombre,
    email: row.email,
    rol: row.rol,
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
  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      rol: user.rol,
      iat: nowSeconds,
      exp: nowSeconds + SESSION_TTL_SECONDS,
    }),
  );

  return {
    usuario: user,
    token: `ses.${payload}.${sign(payload)}`,
  };
}

function parseToken(token) {
  const [prefix, payload, signature] = String(token ?? "").split(".");

  if (prefix !== "ses" || !payload || !signature || sign(payload) !== signature) {
    throw createHttpError(401, "Sesión inválida o vencida.");
  }

  try {
    const parsedPayload = JSON.parse(base64UrlDecode(payload));
    const nowSeconds = Math.floor(Date.now() / 1000);

    if (!Number.isFinite(parsedPayload.exp) || parsedPayload.exp <= nowSeconds) {
      throw createHttpError(401, "Sesión inválida o vencida.");
    }

    return parsedPayload;
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
        "INSERT INTO usuarios (nombre, email, hash_contrasena, rol) VALUES (?, ?, ?, ?)",
        [name, email, hashPassword(password), ROL_PREDETERMINADO],
      );

      return createSession({
        id: String(result.insertId),
        nombre: name,
        email,
        rol: ROL_PREDETERMINADO,
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
    const password = String(payload.contrasena ?? "");

    assertEmail(email);
    assertPassword(password);

    const [rows] = await pool.execute(
      "SELECT id, nombre, email, hash_contrasena, rol FROM usuarios WHERE email = ? LIMIT 1",
      [email],
    );
    const user = rows[0];

    if (!user || !verifyPassword(password, user.hash_contrasena)) {
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
      "SELECT id, nombre, email, rol FROM usuarios WHERE id = ? LIMIT 1",
      [userId],
    );
    const user = rows[0];

    if (!user) {
      throw createHttpError(401, "Sesión inválida o vencida.");
    }

    return mapUser(user);
  },
};
