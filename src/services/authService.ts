import type {
  AuthSession,
  LoginCredentials,
  LoginResult,
  RegisterCredentials,
} from "@/models/auth";
import { API_BASE_URL } from "@/services/apiConfig";

let currentSession: AuthSession | null = null;

function normalizeStoredSession(value: unknown): AuthSession | null {
  if (!value || typeof value !== "object") return null;

  const rawSession = value as AuthSession;
  const usuario = rawSession.usuario;

  return rawSession.csrfToken && usuario?.email
    ? { csrfToken: rawSession.csrfToken, usuario }
    : null;
}

function persistSession(session: AuthSession | null) {
  currentSession = session;
}

async function requestAuth(path: string, body: LoginCredentials | RegisterCredentials) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      persistSession(null);
      return {
        ok: false,
        error: data?.error?.message ?? "No se pudo completar la operación.",
      };
    }

    const result = data as LoginResult & { sesion?: AuthSession };
    const sesion = normalizeStoredSession(result.sesion ?? result.session);
    if (result.ok && sesion) {
      persistSession(sesion);
    }

    return { ...result, session: sesion ?? undefined };
  } catch {
    persistSession(null);
    return {
      ok: false,
      error: "No se pudo conectar con el backend. Verificá que la API esté iniciada.",
    };
  }
}

export const authService = {
  getSession(): AuthSession | null {
    return currentSession;
  },

  clearSession() {
    persistSession(null);
  },

  getCsrfToken(): string | null {
    return currentSession?.csrfToken ?? null;
  },

  async login(credentials: LoginCredentials): Promise<LoginResult> {
    return requestAuth("/autenticacion/login", credentials);
  },

  async register(credentials: RegisterCredentials): Promise<LoginResult> {
    return requestAuth("/autenticacion/registro", credentials);
  },

  async refreshSession(): Promise<AuthSession | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/autenticacion/sesion`, {
        credentials: "include",
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        persistSession(null);
        return null;
      }

      const session = normalizeStoredSession(data?.sesion ?? data?.session);
      persistSession(session);
      return session;
    } catch {
      persistSession(null);
      return null;
    }
  },

  async logout(): Promise<{ ok: boolean; error?: string }> {
    const csrfToken = this.getCsrfToken();

    if (!csrfToken) {
      persistSession(null);
      return { ok: false, error: "No hay una sesión activa para cerrar." };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/autenticacion/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRF-Token": csrfToken },
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          ok: false,
          error: data?.error?.message ?? "No se pudo cerrar sesión en el backend.",
        };
      }

      persistSession(null);
      return { ok: true };
    } catch {
      return { ok: false, error: "No se pudo conectar con el backend para cerrar sesión." };
    }
  },
};
