import type {
  AuthSession,
  LoginCredentials,
  LoginResult,
  RegisterCredentials,
} from "@/models/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";
const SESSION_STORAGE_KEY = "softwareestres.session";

function normalizeStoredSession(value: unknown): AuthSession | null {
  if (!value || typeof value !== "object") return null;

  const rawSession = value as AuthSession;
  const usuario = rawSession.usuario;

  return rawSession.token && usuario?.email ? { token: rawSession.token, usuario } : null;
}

async function requestAuth(path: string, body: LoginCredentials | RegisterCredentials) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        error: data?.error?.message ?? "No se pudo completar la operación.",
      };
    }

    const result = data as LoginResult & { sesion?: AuthSession };
    const sesion = result.sesion ?? result.session;
    if (result.ok && sesion && typeof window !== "undefined") {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sesion));
    }

    return { ...result, session: sesion };
  } catch {
    return {
      ok: false,
      error: "No se pudo conectar con el backend. Verificá que la API esté iniciada.",
    };
  }
}

export const authService = {
  getSession(): AuthSession | null {
    if (typeof window === "undefined") return null;

    try {
      const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (!rawSession) return null;

      const session = normalizeStoredSession(JSON.parse(rawSession));
      if (session) {
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      }
      return session;
    } catch {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  },

  async login(credentials: LoginCredentials): Promise<LoginResult> {
    return requestAuth("/autenticacion/login", credentials);
  },

  async register(credentials: RegisterCredentials): Promise<LoginResult> {
    return requestAuth("/autenticacion/registro", credentials);
  },

  logout() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  },

  getToken(): string | null {
    return this.getSession()?.token ?? null;
  },
};
