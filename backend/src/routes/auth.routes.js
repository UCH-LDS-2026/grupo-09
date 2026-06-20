import { Router } from "express";

import { authController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { loginRateLimitMiddleware } from "../middlewares/rate-limit.middleware.js";

export const authRouter = Router();

authRouter.post("/registro", authController.register);
authRouter.post("/login", loginRateLimitMiddleware(), authController.login);
authRouter.get("/sesion", authMiddleware, authController.getSession);
authRouter.post("/logout", authMiddleware, authController.logout);
