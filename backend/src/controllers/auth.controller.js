import { authService } from "../services/auth.service.js";

function sendSession(response, statusCode, session) {
  authService.setSessionCookie(response, session.token);
  response.status(statusCode).json({ ok: true, sesion: authService.publicSession(session) });
}

export const authController = {
  async register(request, response, next) {
    try {
      const sesion = await authService.register(request.body);
      sendSession(response, 201, sesion);
    } catch (error) {
      next(error);
    }
  },

  async login(request, response, next) {
    try {
      const sesion = await authService.login(request.body);
      sendSession(response, 200, sesion);
    } catch (error) {
      next(error);
    }
  },

  getSession(request, response) {
    response.status(200).json({
      ok: true,
      sesion: {
        usuario: request.user,
        csrfToken: request.auth?.csrfToken,
      },
    });
  },

  logout(_request, response) {
    authService.clearSessionCookie(response);
    response.status(200).json({ ok: true });
  },
};
