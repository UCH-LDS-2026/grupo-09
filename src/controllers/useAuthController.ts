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

    try {
      const result = await authService.login(credentials);

      if (!result.ok || !result.session) {
        setError(result.error ?? "No se pudo iniciar sesión.");
        return false;
      }

      setSession(result.session);
      return true;
    } finally {
      setIsSubmitting(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await authService.register(credentials);

      if (!result.ok || !result.session) {
        setError(result.error ?? "No se pudo crear la cuenta.");
        return false;
      }

      setSession(result.session);
      return true;
    } finally {
      setIsSubmitting(false);
    }
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
    user: session?.usuario ?? null,
  };
}
