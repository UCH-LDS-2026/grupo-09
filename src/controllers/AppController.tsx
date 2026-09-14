import { SimulatorView } from "@/views/simulator/SimulatorView";
import { LoginView } from "@/views/auth/LoginView";
import { useAuthController } from "@/controllers/useAuthController";

export function AppController() {
  const auth = useAuthController();

  if (auth.isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Verificando sesión...</p>
      </main>
    );
  }

  if (!auth.user) {
    return (
      <LoginView
        error={auth.error}
        isSubmitting={auth.isSubmitting}
        onLogin={auth.login}
        onModeChange={auth.clearError}
        onRegister={auth.register}
      />
    );
  }

  return <SimulatorView user={auth.user} onLogout={auth.logout} />;
}
