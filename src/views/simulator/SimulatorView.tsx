import SimulatorDashboard from "@/components/SimulatorDashboard";
import type { UsuarioAutenticado } from "@/models/auth";

interface SimulatorViewProps {
  user: UsuarioAutenticado;
  onLogout: () => void | Promise<void>;
}

export function SimulatorView({ user, onLogout }: SimulatorViewProps) {
  return <SimulatorDashboard user={user} onLogout={onLogout} />;
}
