import { Router } from "express";

import { simulationsController } from "../controllers/simulations.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const simulationsRouter = Router();

simulationsRouter.use(authMiddleware);
simulationsRouter.post("/ejecutar", simulationsController.run);
