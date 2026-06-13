import type {
  AuthSession,
  LoginCredentials,
  LoginResult,
  RegisterCredentials,
} from "@/models/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";
const SESSION_STORAGE_KEY = "softwareestres.session";

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

    const result = data as LoginResult;
    if (result.ok && result.session && typeof window !== "undefined") {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(result.session));
    }

    return result;
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

      const session = JSON.parse(rawSession) as AuthSession;
      return session?.token && session?.user?.email ? session : null;
    } catch {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  },

  async login(credentials: LoginCredentials): Promise<LoginResult> {
    return requestAuth("/auth/login", credentials);
  },

  async register(credentials: RegisterCredentials): Promise<LoginResult> {
    return requestAuth("/auth/register", credentials);
  },

  logout() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  },

  getToken(): string | null {
    return this.getSession()?.token ?? null;
  },
};
