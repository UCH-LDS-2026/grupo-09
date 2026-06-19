export type RolUsuario = "administrador" | "arquitecto" | "lector";

export interface UsuarioAutenticado {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
}

export interface LoginCredentials {
  email: string;
  contrasena: string;
}

export interface RegisterCredentials extends LoginCredentials {
  nombre: string;
}

export interface AuthSession {
  usuario: UsuarioAutenticado;
  token: string;
}

export interface LoginResult {
  ok: boolean;
  session?: AuthSession;
  error?: string;
}
