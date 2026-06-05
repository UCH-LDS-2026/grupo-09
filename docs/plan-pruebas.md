# Plan de pruebas

Este plan separa pruebas unitarias, pruebas de integración y pruebas manuales de aceptación.

## Pruebas unitarias recomendadas

### `shared/simulator-core.js`

Estas pruebas cubren el núcleo compartido que usan frontend y backend. `src/lib/simulator.ts` sólo reexporta este módulo para la UI.

- `canConnect` permite `api_gateway -> load_balancer`.
- `canConnect` permite `api_gateway -> app_service`.
- `canConnect` permite `load_balancer -> app_service`.
- `canConnect` permite `app_service -> database`.
- `canConnect` permite `app_service -> queue`.
- `canConnect` permite `queue -> app_service`.
- `canConnect` bloquea `database -> app_service`.
- `canConnect` bloquea `load_balancer -> database`.
- `validateConnection` bloquea conexión consigo mismo.
- `validateConnection` bloquea conexión duplicada.
- `validateConnection` bloquea ciclos.
- `statusFor` devuelve estable con carga menor a 70%.
- `statusFor` devuelve advertencia con carga entre 70% y 89%.
- `statusFor` devuelve alta carga con carga entre 90% y 99%.
- `statusFor` devuelve saturado con carga mayor o igual a 100%.
- `statusFor` devuelve error cuando errorRate es mayor a 0.
- `calculateLatency` aumenta latencia según carga.
- `simulate` calcula capacidad total como `instancias * capacidad`.
- `simulate` calcula salida procesada como `min(trafico, capacidad)`.
- `simulate` calcula error cuando el tráfico supera capacidad.
- `simulate` detecta cuello de botella como mayor carga.
- `normalizeProjectGraph` rechaza nodos duplicados.
- `normalizeProjectGraph` rechaza conexiones a nodos inexistentes.
- `normalizeProjectGraph` rechaza conexiones inválidas.
- `normalizeProjectGraph` rechaza ciclos.
- `normalizeSimulationPayload` normaliza tráfico negativo a cero.

### `systemConclusionLogic.ts`

- Sin nodos muestra conclusión de arquitectura vacía.
- Simulación detenida muestra conclusión detenida.
- Sistema estable muestra salida procesada y error global.
- Sistema saturado muestra cuello de botella y recomendación.
- Recomendación usa `ceil(trafico_recibido / capacidad_por_instancia)`.

### `projectService.ts`

- Construye query con `userEmail`.
- Usa `POST` cuando no hay `id`.
- Usa `PUT` cuando hay `id`.
- Propaga mensajes de error del backend.

## Pruebas de integración backend

### Health

- `GET /health` devuelve `status: ok`.
- `GET /api/health/db` devuelve `status: ok`.

### Proyectos

- `POST /api/projects` crea proyecto con nodos y conexiones.
- `GET /api/projects?userEmail=` lista proyectos del usuario.
- `GET /api/projects/:id?userEmail=` carga nodos y conexiones.
- `PUT /api/projects/:id` actualiza nombre, tráfico, nodos y conexiones.
- `DELETE /api/projects/:id?userEmail=` elimina proyecto.
- No permite cargar proyecto con otro email.
- No guarda proyecto sin nodos.
- No guarda proyecto sin email de usuario.
- No guarda conexión inválida aunque venga directo por API.
- No guarda ciclos aunque venga directo por API.
- `GET /api/projects/:id` con id no numérico devuelve `400`.

### Simulaciones

- `POST /api/simulations/run` ejecuta simulación por ciclos.
- `POST /api/simulations/run` devuelve `perNode`, `totals` y `cycles`.
- `POST /api/simulations/run` bloquea conexiones inválidas.
- `POST /api/simulations/run` bloquea nodos con tipo desconocido.
- `POST /api/simulations/run` bloquea ciclos.

### Seguridad mínima

- Las respuestas de API incluyen `X-Content-Type-Options`.
- Las respuestas de API incluyen `X-Frame-Options`.
- Las respuestas de API incluyen `Referrer-Policy`.
- El rate limit devuelve `429` si se supera el límite.

## Pruebas integrales frontend-backend

- Abrir frontend.
- Crear proyecto nuevo.
- Agregar API Gateway.
- Agregar Load Balancer.
- Agregar App Service.
- Agregar Database.
- Conectar en orden.
- Configurar tráfico en 600 req/s.
- Configurar App Service con 2 instancias y 550 req/s.
- Configurar Database con 1 instancia y 600 req/s.
- Ejecutar simulación.
- Confirmar que el frontend recibe resultado desde `/api/simulations/run`.
- Ver métricas coherentes.
- Ver conclusión estable.
- Guardar proyecto con nombre.
- Cargar proyecto guardado.
- Confirmar que nodos y conexiones se mantienen.
- Borrar proyecto.

## Pruebas manuales de errores

- Intentar `Load Balancer -> Database`.
- Intentar `Database -> API Gateway`.
- Intentar conexión duplicada.
- Intentar ciclo.
- Guardar proyecto sin nombre.
- Guardar proyecto sin nodos.
- Poner tráfico alto y confirmar saturación.
- Detener simulación y confirmar conclusión detenida.

## Herramientas sugeridas

- Unitarias frontend/dominio: Vitest.
- Componentes React: React Testing Library.
- Backend API: Node test runner o Vitest + Supertest.
- E2E: Playwright.

## Orden recomendado para implementar tests

1. Unitarias de `shared/simulator-core.js`.
2. Unitarias de `systemConclusionLogic.ts`.
3. Integración de backend `/api/projects`.
4. Integración de backend `/api/simulations/run`.
5. E2E del flujo principal en Playwright.
