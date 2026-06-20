import { authService } from "../services/auth.service.js";

function parseCookies(header = "") {
  return Object.fromEntries(
    header
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const separatorIndex = cookie.indexOf("=");
        if (separatorIndex === -1) return [cookie, ""];
        return [
          cookie.slice(0, separatorIndex),
          decodeURIComponent(cookie.slice(separatorIndex + 1)),
        ];
      }),
  );
}

export async function authMiddleware(request, _response, next) {
  try {
    const cookies = parseCookies(request.get("cookie"));
    const token = cookies[authService.cookieName];

    if (!token) {
      const error = new Error("Iniciá sesión para acceder a este recurso.");
      error.statusCode = 401;
      throw error;
    }

    const session = await authService.authenticateToken(token);
    request.user = session.usuario;
    request.auth = {
      csrfToken: session.csrfToken,
      viaCookie: true,
    };
    next();
  } catch (error) {
    next(error);
  }
}
