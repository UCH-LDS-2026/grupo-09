import { Router } from "express";

import { simulationsController } from "../controllers/simulations.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { csrfMiddleware } from "../middlewares/csrf.middleware.js";

export const simulationsRouter = Router();

simulationsRouter.use(authMiddleware);
simulationsRouter.use(csrfMiddleware);
simulationsRouter.post("/ejecutar", simulationsController.run);
