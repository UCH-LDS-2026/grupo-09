export type UserRole = "admin" | "architect" | "viewer";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}

export interface LoginResult {
  ok: boolean;
  session?: AuthSession;
  error?: string;
}
