import SimulatorDashboard from "@/components/SimulatorDashboard";
import type { AuthUser } from "@/models/auth";

interface SimulatorViewProps {
  user: AuthUser;
  onLogout: () => void;
}

export function SimulatorView({ user, onLogout }: SimulatorViewProps) {
  return <SimulatorDashboard user={user} onLogout={onLogout} />;
}
