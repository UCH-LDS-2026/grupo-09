import { createFileRoute } from "@tanstack/react-router";
import { AppController } from "@/controllers/AppController";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Simulador de arquitectura distribuida" },
      {
        name: "description",
        content:
          "Construí, simulá y probá arquitecturas distribuidas en tiempo real. Visualizá cuellos de botella, latencia y costo.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <AppController />;
}
