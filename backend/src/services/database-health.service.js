import { getDatabasePool } from "../config/database.js";
import { env } from "../config/env.js";

export const databaseHealthService = {
  async getStatus() {
    const pool = getDatabasePool();
    const startedAt = performance.now();

    await pool.query("SELECT 1 AS connection_ok");

    return {
      status: "ok",
      database: env.db.name,
      host: env.db.host,
      latencyMs: Math.round(performance.now() - startedAt),
    };
  },
};
