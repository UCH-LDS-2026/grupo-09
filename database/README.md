# Base de datos del MVP

La base `softwareestres` guarda lo mínimo necesario para que el simulador sea usable:

- usuarios demo,
- proyectos,
- nodos del canvas,
- conexiones dirigidas,
- catálogo de componentes,
- tablas preparadas para corridas, métricas y recomendaciones.

## Núcleo usado hoy

### `projects`

Guarda el nombre del proyecto, el tráfico configurado y si la simulación está corriendo.

### `projects_nodes`

Guarda cada componente colocado en el canvas:

- tipo,
- nombre,
- posición,
- instancias,
- capacidad por instancia,
- latencia base,
- costo por instancia.

### `projects_edges`

Guarda conexiones dirigidas:

- `from_node_id`: nodo origen,
- `to_node_id`: nodo destino.

Esto permite representar flujos como `API Gateway -> Load Balancer -> App Service -> Database`.

### `component_types`

Catálogo de componentes disponibles para el MVP:

- `api_gateway`
- `load_balancer`
- `app_service`
- `database`
- `queue`

`cache` queda desactivado con `is_active = FALSE` porque complica la explicación del MVP.

## Tablas preparadas

Estas tablas quedan listas para fases posteriores, pero no son necesarias para usar el MVP actual:

- `objective_types`
- `project_objectives`
- `simulation_runs`
- `simulation_node_metrics`
- `scaling_recommendations`

## Migraciones

Aplicar en orden:

```txt
database/schema.sql
database/migrations/001-align-user-roles.sql
database/migrations/002-mvp-component-cleanup.sql
```

La migración `002` desactiva caché y alinea los estados de métricas con el simulador actual.
