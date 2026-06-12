import { authService } from "../services/auth.service.js";

export const authController = {
  async register(request, response, next) {
    try {
      const session = await authService.register(request.body);
      response.status(201).json({ ok: true, session });
    } catch (error) {
      next(error);
    }
  },

  async login(request, response, next) {
    try {
      const session = await authService.login(request.body);
      response.status(200).json({ ok: true, session });
    } catch (error) {
      next(error);
    }
  },
};
