import type { AuthSession, LoginCredentials, LoginResult } from "@/models/auth";

const SESSION_KEY = "distributed-architecture-session";

const demoUsers = [
  {
    id: "usr_admin",
    name: "Admin Arquitectura",
    email: "admin@sistema.test",
    password: "admin123",
    role: "admin" as const,
  },
  {
    id: "usr_architect",
    name: "Arquitecto Demo",
    email: "arquitecto@sistema.test",
    password: "demo1234",
    role: "architect" as const,
  },
];

const isBrowser = () => typeof window !== "undefined";

const wait = (ms: number) => new Promise((resolve) => globalThis.setTimeout(resolve, ms));

export const authService = {
  getSession(): AuthSession | null {
    if (!isBrowser()) return null;

    const rawSession = window.localStorage.getItem(SESSION_KEY);
    if (!rawSession) return null;

    try {
      return JSON.parse(rawSession) as AuthSession;
    } catch {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
  },

  async login(credentials: LoginCredentials): Promise<LoginResult> {
    await wait(350);

    const email = credentials.email.trim().toLowerCase();
    const user = demoUsers.find(
      (candidate) => candidate.email === email && candidate.password === credentials.password,
    );

    if (!user) {
      return {
        ok: false,
        error: "Correo o contraseña incorrectos.",
      };
    }

    const { password: _password, ...safeUser } = user;
    const session: AuthSession = {
      user: safeUser,
      token: `demo-token-${safeUser.id}`,
    };

    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, session };
  },

  logout() {
    if (!isBrowser()) return;

    window.localStorage.removeItem(SESSION_KEY);
  },
};
