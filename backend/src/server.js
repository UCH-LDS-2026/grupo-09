import { createApp } from "./app.js";
import { closeDatabasePool } from "./config/database.js";
import { env } from "./config/env.js";

const app = createApp();

const server = app.listen(env.api.port, () => {
  console.log(`API running on http://localhost:${env.api.port}`);
});

const shutdown = async (signal) => {
  console.log(`${signal} received. Closing API server...`);

  await closeDatabasePool();

  server.close(() => {
    console.log("API server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
