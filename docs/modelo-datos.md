# Modelo de datos

El modelo esta orientado a guardar proyectos visuales del simulador de arquitectura distribuida. El frontend trabaja con usuarios demo, diagramas de nodos/conexiones y parametros de simulacion; la base de datos conserva esa informacion para que un proyecto pueda listarse, abrirse y actualizarse desde la API.

## Entidades principales

### `users`

Guarda los usuarios que pueden crear proyectos.

Campos principales:

- `id`
- `name`
- `email`
- `password_hash`
- `role`: `admin`, `architect` o `viewer`
- `created_at`
- `updated_at`

### `projects`

Guarda cada arquitectura creada por un usuario.

Campos principales:

- `id`
- `user_id`
- `name`
- `slug`
- `description`
- `incoming_traffic_rps`
- `is_running`
- `created_at`
- `updated_at`

### `component_categories`

Agrupa los tipos de componentes que aparecen en la biblioteca visual.

Campos principales:

- `id`
- `name`
- `display_order`
- `created_at`

### `component_types`

Define el catalogo de componentes disponibles para el MVP: API Gateway, Load Balancer, App Service, Database y Queue. Cache queda desactivado por ahora (`is_active = false`) para mantener simple la explicacion del simulador.

Campos principales:

- `id`
- `category_id`
- `code`
- `label`
- `icon`
- `color_token`
- valores por defecto de instancias, capacidad, latencia, cola, timeout y costo
- `is_active`

### `projects_nodes`

Guarda cada componente colocado en el canvas de un proyecto.

Campos principales:

- `id`
- `project_id`
- `component_type_id`
- `client_node_id`
- `name`
- `position_x`
- `position_y`
- `instances`
- `capacity_rps`
- `base_latency_ms`
- `queue_size`
- `timeout_ms`
- `cost_per_instance`

### `projects_edges`

Guarda las conexiones entre nodos del diagrama.

Campos principales:

- `id`
- `project_id`
- `client_edge_id`
- `from_node_id`
- `to_node_id`
- `is_async`

### `objective_types` y `project_objectives`

Permiten definir metas de simulacion, como latencia maxima, error maximo, throughput minimo o costo mensual maximo.

### `simulation_runs`, `simulation_node_metrics` y `scaling_recommendations`

Preparan la persistencia futura de corridas de simulacion, metricas por nodo y recomendaciones de escalado.

## Relaciones

- Un `user` tiene muchos `projects`.
- Un `project` tiene muchos `projects_nodes` y `projects_edges`.
- Un `projects_node` pertenece a un `component_type`.
- Un `projects_edge` conecta dos nodos del mismo proyecto.
- Un `project` puede tener objetivos y muchas corridas de simulacion.
- Cada corrida puede guardar metricas por nodo y recomendaciones.

## Estado para MVP

Ya esta lista la parte necesaria para persistir proyectos: usuarios, proyectos, nodos, conexiones dirigidas y catalogo de componentes. Para el MVP visual, alcanza con que el frontend pueda guardar y cargar diagramas. Las tablas de simulaciones, metricas y recomendaciones quedan preparadas para fases posteriores.
