import { authService } from "../services/auth.service.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function csrfMiddleware(request, _response, next) {
  if (SAFE_METHODS.has(request.method) || !request.auth?.viaCookie) {
    next();
    return;
  }

  const csrfToken = request.get(authService.csrfHeaderName);

  if (!csrfToken || csrfToken !== request.auth.csrfToken) {
    const error = new Error("Token CSRF inválido o ausente.");
    error.statusCode = 403;
    next(error);
    return;
  }

  next();
}
