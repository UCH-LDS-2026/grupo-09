import { Router } from "express";

import { databaseHealthController } from "../controllers/database-health.controller.js";
import { healthController } from "../controllers/health.controller.js";

export const healthRouter = Router();

healthRouter.get("/", healthController.getHealth);
healthRouter.get("/db", databaseHealthController.getHealth);
