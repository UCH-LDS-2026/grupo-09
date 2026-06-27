import { Router } from "express";

import { authRouter } from "./auth.routes.js";
import { healthRouter } from "./health.routes.js";
import { projectsRouter } from "./projects.routes.js";
import { projectVersionsRouter } from "./project-versions.routes.js";
import { simulationsRouter } from "./simulations.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/autenticacion", authRouter);
apiRouter.use("/proyectos", projectVersionsRouter);
apiRouter.use("/proyectos", projectsRouter);
apiRouter.use("/simulaciones", simulationsRouter);
