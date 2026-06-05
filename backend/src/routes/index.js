import { Router } from "express";

import { healthRouter } from "./health.routes.js";
import { projectsRouter } from "./projects.routes.js";
import { simulationsRouter } from "./simulations.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/projects", projectsRouter);
apiRouter.use("/simulations", simulationsRouter);
