import { createFileRoute } from "@tanstack/react-router";
import SimulatorDashboard from "@/components/SimulatorDashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Distributed Architecture Simulator" },
      {
        name: "description",
        content:
          "Build, simulate, and stress-test distributed system architectures in real time. Visualize bottlenecks, latency, and cost.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <SimulatorDashboard />;
}
