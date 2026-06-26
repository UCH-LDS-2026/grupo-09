# Simulation and Persistence Contract

Fecha: 2026-06-26

Este documento define como viajan los campos principales entre frontend, backend, motor compartido y base de datos. El objetivo es evitar drift cuando se agreguen nuevas dimensiones de simulacion.

## Regla General

- El frontend nunca accede a MySQL directamente.
- El backend recibe DTOs en español, normaliza al modelo del simulador y valida con `shared/simulator-core.js`.
- La base de datos persiste solo datos normalizados y vinculados a `usuario_id`.
- Si aparece un campo nuevo, debe tener default en motor compartido, mapeo frontend/backend, persistencia o una razon explicita para no persistirlo, y tests.

## Proyecto

| Concepto | Frontend | Backend DTO | DB | Default |
|---|---|---|---|---|
| Nombre | `nombreProyecto` | `nombre` | `proyectos.nombre` | `Proyecto sin nombre` |
| Trafico | `traffic` | `trafico` | `proyectos.trafico_entrante_rps` | `600` |
| Tamaño request | `averageRequestSizeKb` | `averageRequestSizeKb` | `proyectos.average_request_size_kb` | `5` |
| % requests pesados | `heavyRequestPercentage` | `heavyRequestPercentage` | `proyectos.heavy_request_percentage` | `0` |
| Tamaño request pesado | `heavyRequestSizeKb` | `heavyRequestSizeKb` | `proyectos.heavy_request_size_kb` | `50` |
| Estado ejecucion | `estaEjecutando` | `estaEjecutando` | `proyectos.esta_ejecutando` | `true` |

## Nodo

| Concepto | Frontend `SimNode` | Backend DTO | DB | Default |
|---|---|---|---|---|
| Tipo | `kind` | `tipo` | `tipos_componentes.codigo` | requerido |
| Nombre | `name` | `nombre` | `nodos_proyectos.nombre` | `Componente` |
| Posicion | `x`, `y` | `posicionX`, `posicionY` | `posicion_x`, `posicion_y` | requerido al guardar |
| Instancias | `instances` | `instancias` | `instancias` | por tipo |
| Capacidad | `capacity` | `capacidadRps` | `capacidad_rps` | por tipo |
| Latencia base | `baseLatency` | `latenciaBaseMs` | `latencia_base_ms` | por tipo |
| Cola | `queueSize` | `tamanoCola` | `tamano_cola` | por tipo |
| Timeout | `timeout` | `tiempoEsperaMs` | `tiempo_espera_ms` | por tipo |
| Costo | `costPerInstance` | `costoPorInstancia` | `costo_por_instancia` | por tipo |
| Bandwidth | `bandwidthMbps` | `anchoBandaMbps` | `ancho_banda_mbps` | por tipo |

## Conexion

| Concepto | Frontend `SimEdge` | Backend DTO | DB | Default |
|---|---|---|---|---|
| ID cliente | `id` | `id` | `conexion_cliente_id` | requerido |
| Origen | `from` | `origen` | `nodo_origen_id` via nodo cliente | requerido |
| Destino | `to` | `destino` | `nodo_destino_id` via nodo cliente | requerido |
| Async | `async` | `esAsincrona` | `es_asincrona` | `false` |

## Validaciones Obligatorias por Cambio Futuro

1. Actualizar `shared/simulator-core.js` y `shared/simulator-core.d.ts`.
2. Actualizar `src/services/projectService.ts` si el campo se guarda o carga.
3. Actualizar `backend/src/services/projects.service.js` si el campo se persiste.
4. Actualizar `backend/src/services/simulations.service.js` si el campo afecta simulacion remota.
5. Actualizar `database/schema.sql` y migracion si se agrega columna.
6. Agregar tests de defaults antiguos y payload nuevo.
7. Actualizar `docs/simulation-model.md` si cambia la formula o significado.
