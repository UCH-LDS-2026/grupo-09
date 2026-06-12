import { useState } from "react";
import type { AuthSession, LoginCredentials, RegisterCredentials } from "@/models/auth";
import { authService } from "@/services/authService";

export function useAuthController() {
  const [session, setSession] = useState<AuthSession | null>(() => authService.getSession());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setIsSubmitting(true);
    setError(null);

    const result = await authService.login(credentials);
    setIsSubmitting(false);

    if (!result.ok || !result.session) {
      setError(result.error ?? "No se pudo iniciar sesión.");
      return false;
    }

    setSession(result.session);
    return true;
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsSubmitting(true);
    setError(null);

    const result = await authService.register(credentials);
    setIsSubmitting(false);

    if (!result.ok || !result.session) {
      setError(result.error ?? "No se pudo crear la cuenta.");
      return false;
    }

    setSession(result.session);
    return true;
  };

  const logout = () => {
    authService.logout();
    setSession(null);
  };

  return {
    error,
    isAuthenticated: Boolean(session),
    isSubmitting,
    login,
    logout,
    register,
    session,
    user: session?.user ?? null,
  };
}
