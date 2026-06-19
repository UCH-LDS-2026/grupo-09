import { authService } from "../services/auth.service.js";

export const authController = {
  async register(request, response, next) {
    try {
      const sesion = await authService.register(request.body);
      response.status(201).json({ ok: true, sesion });
    } catch (error) {
      next(error);
    }
  },

  async login(request, response, next) {
    try {
      const sesion = await authService.login(request.body);
      response.status(200).json({ ok: true, sesion });
    } catch (error) {
      next(error);
    }
  },
};
