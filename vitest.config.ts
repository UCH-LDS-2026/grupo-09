import { defineConfig } from "vitest/config";

// Configuracion dedicada para los tests.
// Se separa del vite.config.ts principal porque el plugin de Lovable
// no es compatible con la forma en que Vitest carga la configuracion.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.{test,spec}.{js,ts,tsx}"],
  },
});
