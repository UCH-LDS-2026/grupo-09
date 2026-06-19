import { Router } from "express";

import { authController } from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/registro", authController.register);
authRouter.post("/login", authController.login);
