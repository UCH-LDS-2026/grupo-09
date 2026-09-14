import { getDatabasePool } from "../config/database.js";

export const databaseHealthService = {
  async getStatus() {
    const pool = getDatabasePool();
    await pool.query("SELECT 1 AS connection_ok");

    return {
      status: "ok",
      database: "available",
    };
  },
};
