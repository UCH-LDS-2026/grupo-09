import { SimulatorView } from "@/views/simulator/SimulatorView";
import { LoginView } from "@/views/auth/LoginView";
import { useAuthController } from "@/controllers/useAuthController";

export function AppController() {
  const auth = useAuthController();

  if (!auth.user) {
    return (
      <LoginView
        error={auth.error}
        isSubmitting={auth.isSubmitting}
        onLogin={auth.login}
        onRegister={auth.register}
      />
    );
  }

  return <SimulatorView user={auth.user} onLogout={auth.logout} />;
}
