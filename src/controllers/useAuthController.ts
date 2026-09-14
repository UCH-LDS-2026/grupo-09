import { useEffect, useState } from "react";
import type { AuthSession, LoginCredentials, RegisterCredentials } from "@/models/auth";
import { authService } from "@/services/authService";

export function useAuthController() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void authService.refreshSession().then((freshSession) => {
      if (!cancelled) {
        setSession(freshSession);
        setIsCheckingSession(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

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

  const logout = async () => {
    setError(null);
    const result = await authService.logout();

    if (!result.ok) {
      setError(result.error ?? "No se pudo cerrar sesión.");
      return;
    }

    setSession(null);
  };

  return {
    error,
    isAuthenticated: Boolean(session),
    isCheckingSession,
    isSubmitting,
    clearError: () => setError(null),
    login,
    logout,
    register,
    session,
    user: session?.usuario ?? null,
  };
}
