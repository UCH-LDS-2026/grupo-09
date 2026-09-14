import { Router } from "express";

import { projectVersionsController } from "../controllers/project-versions.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { csrfMiddleware } from "../middlewares/csrf.middleware.js";

export const projectVersionsRouter = Router();

projectVersionsRouter.use(authMiddleware);
projectVersionsRouter.use(csrfMiddleware);
projectVersionsRouter.get("/:projectId/versiones", projectVersionsController.list);
projectVersionsRouter.post("/:projectId/versiones", projectVersionsController.create);
projectVersionsRouter.get("/:projectId/versiones/:versionId", projectVersionsController.getById);
