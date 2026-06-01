import { Router } from "express";

import { healthRouter } from "./health.routes.js";
import { projectsRouter } from "./projects.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/projects", projectsRouter);
