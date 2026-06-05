# Arquitectura del MVP

El MVP es un simulador visual básico de arquitectura distribuida.

El usuario puede:

1. Crear un proyecto.
2. Arrastrar componentes al canvas.
3. Conectar componentes válidos.
4. Configurar tráfico.
5. Ejecutar o detener la simulación.
6. Ver carga, salida procesada, latencia, error, costo, cuello de botella y conclusión.
7. Guardar y cargar proyectos desde backend/base de datos.
8. Ejecutar simulación desde backend con reglas compartidas.

## Capas

- `src/controllers`: coordina la pantalla principal.
- `src/views`: monta la vista del simulador.
- `src/components`: contiene el dashboard y piezas visuales del simulador.
- `shared/simulator-core.js`: reglas de conexión, validación de grafo y motor de simulación por ciclos.
- `src/lib/simulator.ts`: fachada frontend tipada que reexporta el núcleo compartido.
- `src/services/projectService.ts`: conexión frontend-backend para proyectos.
- `src/services/simulationService.ts`: conexión frontend-backend para ejecutar simulaciones.
- `backend/src`: API HTTP, servicios, simulación backend y acceso a MySQL.
- `database`: schema y migraciones.

## Flujo Principal

```txt
SimulatorDashboard
  -> projectService
  -> backend /api/projects
  -> MySQL
```

## Flujo de Simulación

```txt
SimulatorDashboard
  -> simulationService
  -> backend /api/simulations/run
  -> shared/simulator-core.js
  -> resultado por nodo, totales y ciclos
```

El frontend mantiene un fallback local usando el mismo `shared/simulator-core.js` para que la interfaz no quede inutilizable si el backend no responde durante desarrollo.

## Componentes Del MVP

- API Gateway
- Load Balancer
- App Service
- Database
- Queue

Cache queda desactivado por ahora para mantener simple la explicación.

## Seguridad Actual

El MVP usa un usuario demo fijo para guardar proyectos. Esto evita simular un login real inseguro.

Ya está implementado para MVP:

- validación backend de nodos y conexiones,
- validación de ciclos y conexiones inválidas,
- validación de ids de proyecto,
- headers mínimos de seguridad,
- rate limit simple para `/api`,
- límite JSON de `1mb`.

Para una fase posterior:

- autenticación real,
- sesiones,
- permisos por usuario con token,
- historial persistido de corridas.
