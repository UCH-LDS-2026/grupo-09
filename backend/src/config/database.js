import mysql from "mysql2/promise";

import { env } from "./env.js";

let pool;

export function getDatabasePool() {
  if (!pool) {
    pool = mysql.createPool({
      host: env.db.host,
      port: env.db.port,
      database: env.db.name,
      user: env.db.user,
      password: env.db.password,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }

  return pool;
}

export async function closeDatabasePool() {
  if (!pool) return;

  await pool.end();
  pool = undefined;
}
