import { authService } from "../services/auth.service.js";

export async function authMiddleware(request, _response, next) {
  try {
    const header = request.get("authorization") ?? "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      const error = new Error("Iniciá sesión para acceder a este recurso.");
      error.statusCode = 401;
      throw error;
    }

    request.user = await authService.authenticateToken(token);
    next();
  } catch (error) {
    next(error);
  }
}
