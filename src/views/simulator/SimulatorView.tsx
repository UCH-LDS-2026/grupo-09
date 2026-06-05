import SimulatorDashboard from "@/components/SimulatorDashboard";
import type { AuthUser } from "@/models/auth";

interface SimulatorViewProps {
  user: AuthUser;
}

export function SimulatorView({ user }: SimulatorViewProps) {
  return <SimulatorDashboard user={user} />;
}
