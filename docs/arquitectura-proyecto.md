# Estructura del Proyecto

```txt
src/
  components/
    SimulatorDashboard.tsx
    DefaultErrorComponent.tsx
    simulator/
      ConnectionsPanel.tsx
      Metric.tsx
      PropertiesPanel.tsx
      ResizeHandle.tsx
      SystemConclusion.tsx
      simulatorConfig.ts
      systemConclusionLogic.ts
    ui/
      badge.tsx
      button.tsx
      dropdown-menu.tsx
      input.tsx
      label.tsx
      slider.tsx
  controllers/
    AppController.tsx
  lib/
    simulator.ts
    node-icons.ts
    utils.ts
  models/
    auth.ts
  routes/
    __root.tsx
    index.tsx
  services/
    projectService.ts
  views/
    simulator/
      SimulatorView.tsx

backend/
  src/
    app.js
    server.js
    config/
    controllers/
    middlewares/
    routes/
    services/

database/
  schema.sql
  migrations/
```

## Regla De Trabajo

Para el MVP, mantener el simulador simple:

- UI mínima.
- Reglas de conexión claras.
- Backend enfocado en proyectos.
- Base de datos preparada, pero sin funcionalidades extra visibles.

`dist/` es generado por build y no se edita manualmente.
