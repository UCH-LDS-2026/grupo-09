import { SimulatorView } from "@/views/simulator/SimulatorView";
import type { AuthUser } from "@/models/auth";

const demoUser: AuthUser = {
  id: "usr_mvp",
  name: "Usuario MVP",
  email: "mvp@sistema.test",
  role: "architect",
};

export function AppController() {
  return <SimulatorView user={demoUser} />;
}
