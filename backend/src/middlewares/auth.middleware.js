import { authService } from "../services/auth.service.js";

function parseCookies(header = "") {
  const cookies = {};

  for (const rawCookie of header.split(";")) {
    const cookie = rawCookie.trim();
    if (!cookie) continue;

    const separatorIndex = cookie.indexOf("=");
    const name = separatorIndex === -1 ? cookie : cookie.slice(0, separatorIndex);
    const rawValue = separatorIndex === -1 ? "" : cookie.slice(separatorIndex + 1);

    try {
      cookies[name] = decodeURIComponent(rawValue);
    } catch {
      cookies[name] = rawValue;
    }
  }

  return cookies;
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
