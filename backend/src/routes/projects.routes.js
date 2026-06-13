import { Router } from "express";

import { projectsController } from "../controllers/projects.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const projectsRouter = Router();

projectsRouter.use(authMiddleware);
projectsRouter.get("/", projectsController.list);
projectsRouter.post("/", projectsController.create);
projectsRouter.get("/:id", projectsController.getById);
projectsRouter.put("/:id", projectsController.update);
projectsRouter.delete("/:id", projectsController.delete);
