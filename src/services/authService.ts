import type {
  AuthSession,
  LoginCredentials,
  LoginResult,
  RegisterCredentials,
} from "@/models/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

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

    return data as LoginResult;
  } catch {
    return {
      ok: false,
      error: "No se pudo conectar con el backend. Verificá que la API esté iniciada.",
    };
  }
}

export const authService = {
  getSession(): AuthSession | null {
    return null;
  },

  async login(credentials: LoginCredentials): Promise<LoginResult> {
    return requestAuth("/auth/login", credentials);
  },

  async register(credentials: RegisterCredentials): Promise<LoginResult> {
    return requestAuth("/auth/register", credentials);
  },

  logout() {
    return;
  },
};
