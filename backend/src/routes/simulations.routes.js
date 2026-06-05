import { Router } from "express";

import { simulationsController } from "../controllers/simulations.controller.js";

export const simulationsRouter = Router();

simulationsRouter.post("/run", simulationsController.run);
