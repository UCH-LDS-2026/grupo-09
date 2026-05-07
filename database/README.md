# Base de datos de Software Estres

Esta base de datos fue diseñada a partir del front del proyecto, especialmente del componente `SimulatorDashboard` y la logica de `src/lib/simulator.ts`.

La aplicacion permite que un usuario cree proyectos de arquitectura distribuida, arme diagramas con componentes como API Gateway, Load Balancer, servicios, cache, base de datos y colas, y luego ejecute pruebas de estres simuladas para ver carga, latencia, errores, costos, cuellos de botella y recomendaciones.

## Base creada

Nombre de la base:

```sql
softwareestres
```

El script completo esta en:

```txt
database/schema.sql
```

## Modelo general

El modelo se divide en estas partes:

- Usuarios.
- Proyectos de cada usuario.
- Catalogo de componentes disponibles para los diagramas.
- Nodos y conexiones que forman cada diagrama.
- Objetivos de rendimiento o costo.
- Corridas de simulacion.
- Metricas y recomendaciones generadas por cada corrida.

## Clases / tablas

### `users`

Representa a los usuarios que usan la plataforma.

Se creo porque el proyecto necesita guardar trabajos de distintas personas. Cada usuario puede tener sus propios proyectos de simulacion.

Campos principales:

- `id`: identificador unico.
- `name`: nombre del usuario.
- `email`: correo, unico para login.
- `password_hash`: contrasena guardada de forma segura como hash.
- `role`: permite diferenciar usuarios normales y administradores.
- `created_at`, `updated_at`: fechas de creacion y modificacion.

Relacion importante:

- Un usuario puede tener muchos `projects`.

### `projects`

Representa un proyecto creado por un usuario.

Se creo porque el front muestra un simulador de arquitectura y tiene un boton `Save`. Para que ese boton tenga sentido, la arquitectura actual debe guardarse como un proyecto.

Campos principales:

- `id`: identificador unico.
- `user_id`: usuario dueno del proyecto.
- `name`: nombre visible del proyecto.
- `slug`: identificador amigable por usuario.
- `description`: descripcion opcional.
- `incoming_traffic_rps`: trafico de entrada configurado en el slider del front.
- `is_running`: indica si la simulacion esta corriendo o detenida.
- `created_at`, `updated_at`: fechas de control.

Relacion importante:

- Un proyecto pertenece a un `user`.
- Un proyecto tiene muchos `projects_nodes`.
- Un proyecto tiene muchas `projects_edges`.
- Un proyecto puede tener muchos `project_objectives`.
- Un proyecto puede tener muchas `simulation_runs`.

### `component_categories`

Representa las categorias del panel izquierdo del front.

En el dashboard aparecen grupos como:

- `Traffic & Edge`
- `Compute`
- `Messaging`
- `Storage`

Se creo para no dejar esas categorias quemadas solamente en el front. Asi el backend puede devolver el catalogo ordenado y en el futuro se pueden agregar mas categorias.

Campos principales:

- `id`: identificador unico.
- `name`: nombre de la categoria.
- `display_order`: orden visual.
- `created_at`: fecha de creacion.

Relacion importante:

- Una categoria tiene muchos `component_types`.

### `component_types`

Representa los tipos de componentes que el usuario puede arrastrar al diagrama.

Sale directamente de `KIND_META` en `src/lib/simulator.ts`.

Tipos cargados inicialmente:

- `api_gateway`
- `load_balancer`
- `app_service`
- `cache`
- `database`
- `queue`

Se creo porque estos son los "objetos" disponibles para construir diagramas. Cada tipo tiene valores por defecto, icono, color y categoria.

Campos principales:

- `id`: identificador unico.
- `category_id`: categoria a la que pertenece.
- `code`: codigo interno, por ejemplo `api_gateway`.
- `label`: nombre visible, por ejemplo `API Gateway`.
- `icon`: icono usado por el front.
- `color_token`: variable visual del front.
- `default_instances`: cantidad de instancias por defecto.
- `default_capacity_rps`: capacidad por defecto en requests por segundo.
- `default_base_latency_ms`: latencia base por defecto.
- `default_queue_size`: tamano de cola por defecto.
- `default_timeout_ms`: timeout por defecto.
- `default_cost_per_instance`: costo mensual por instancia.
- `is_active`: permite ocultar tipos sin borrarlos.

Relacion importante:

- Un tipo pertenece a una `component_category`.
- Un tipo puede usarse en muchos `projects_nodes`.

### `projects_nodes`

Representa cada componente colocado dentro de un proyecto.

Por ejemplo, si el usuario arrastra un `Database` al canvas, eso se guarda como un registro en esta tabla.

Se creo porque cada proyecto necesita guardar sus nodos concretos, no solo el tipo de componente. Un mismo proyecto puede tener varios `App Service`, varias bases de datos o varias colas, cada uno con su propia posicion y configuracion.

Campos principales:

- `id`: identificador unico en la base.
- `project_id`: proyecto al que pertenece.
- `component_type_id`: tipo de componente usado.
- `client_node_id`: id que usa el front para reconocer el nodo.
- `name`: nombre editable del nodo.
- `position_x`, `position_y`: posicion en el canvas.
- `instances`: cantidad de instancias configuradas.
- `capacity_rps`: capacidad por instancia.
- `base_latency_ms`: latencia base.
- `queue_size`: tamano de cola.
- `timeout_ms`: timeout.
- `cost_per_instance`: costo por instancia.
- `created_at`, `updated_at`: fechas de control.

Relacion importante:

- Un nodo pertenece a un `project`.
- Un nodo pertenece a un `component_type`.
- Un nodo puede participar en muchas conexiones de `projects_edges`.
- Un nodo puede tener metricas en `simulation_node_metrics`.

### `projects_edges`

Representa las conexiones entre nodos del diagrama.

En el front, las conexiones son las lineas entre componentes. Por ejemplo:

- API Gateway -> Load Balancer
- Load Balancer -> App Service
- App Service -> Database
- App Service -> Queue

Se creo porque el simulador necesita saber como fluye el trafico entre componentes.

Campos principales:

- `id`: identificador unico en la base.
- `project_id`: proyecto al que pertenece la conexion.
- `client_edge_id`: id que usa el front para reconocer la conexion.
- `from_node_id`: nodo origen.
- `to_node_id`: nodo destino.
- `is_async`: indica si la conexion es asincronica, como una cola.
- `created_at`: fecha de creacion.

Relacion importante:

- Una conexion pertenece a un `project`.
- Una conexion conecta dos registros de `projects_nodes`.

### `objective_types`

Representa los tipos de objetivos que el usuario puede configurar para una prueba.

Se creo por la idea de definir objetivos para los diagramas. Por ejemplo, el usuario puede querer que la arquitectura cumpla cierta latencia maxima o cierto costo maximo.

Tipos cargados inicialmente:

- `max_avg_latency`: latencia promedio maxima.
- `max_error_rate`: tasa maxima de errores.
- `min_throughput`: throughput minimo.
- `max_monthly_cost`: costo mensual maximo.

Campos principales:

- `id`: identificador unico.
- `code`: codigo interno del objetivo.
- `label`: nombre visible.
- `unit`: unidad, por ejemplo `ms`, `%`, `req/s` o `USD/mo`.
- `comparison`: indica si el objetivo se cumple con menor o igual (`lte`) o mayor o igual (`gte`).
- `created_at`: fecha de creacion.

Relacion importante:

- Un tipo de objetivo puede usarse en muchos `project_objectives`.

### `project_objectives`

Representa los objetivos configurados para un proyecto concreto.

Se creo para guardar cosas como:

- "Este proyecto debe tener latencia menor o igual a 200 ms".
- "Este proyecto debe tener error rate menor o igual a 5%".
- "Este proyecto debe soportar al menos 1000 req/s".
- "Este proyecto no debe superar USD 300 por mes".

Campos principales:

- `id`: identificador unico.
- `project_id`: proyecto al que pertenece.
- `objective_type_id`: tipo de objetivo.
- `target_value`: valor que se quiere cumplir.
- `created_at`, `updated_at`: fechas de control.

Relacion importante:

- Un objetivo pertenece a un `project`.
- Un objetivo usa un `objective_type`.

### `simulation_runs`

Representa cada corrida de simulacion o prueba de estres.

Se creo porque el front calcula resultados como latencia promedio, errores, throughput, costo y cuello de botella. Guardar cada corrida permite tener historial y comparar resultados.

Campos principales:

- `id`: identificador unico.
- `project_id`: proyecto simulado.
- `incoming_traffic_rps`: trafico usado en esa corrida.
- `avg_latency_ms`: latencia promedio total.
- `error_rate`: tasa de error total.
- `throughput_rps`: throughput total.
- `monthly_cost`: costo mensual estimado.
- `bottleneck_node_id`: nodo que genero cuello de botella, si existe.
- `created_at`: fecha de la corrida.

Relacion importante:

- Una corrida pertenece a un `project`.
- Una corrida puede apuntar a un nodo como cuello de botella.
- Una corrida tiene muchas `simulation_node_metrics`.
- Una corrida puede generar `scaling_recommendations`.

### `simulation_node_metrics`

Representa las metricas de cada nodo dentro de una corrida.

Se creo porque el simulador no solo calcula metricas globales, tambien calcula metricas por componente:

- carga
- throughput
- latencia
- error rate
- estado
- costo

Campos principales:

- `id`: identificador unico.
- `simulation_run_id`: corrida a la que pertenece.
- `project_node_id`: nodo medido.
- `load_ratio`: carga del nodo.
- `throughput_rps`: requests por segundo procesados.
- `latency_ms`: latencia efectiva.
- `error_rate`: tasa de error del nodo.
- `status`: estado del nodo: `healthy`, `warning`, `saturated` o `failed`.
- `monthly_cost`: costo mensual del nodo.
- `created_at`: fecha de creacion.

Relacion importante:

- Una metrica pertenece a una `simulation_run`.
- Una metrica pertenece a un `projects_node`.

### `scaling_recommendations`

Representa recomendaciones generadas por una corrida de simulacion.

En el front ya existe la logica que detecta un cuello de botella y recomienda aumentar instancias. Por eso esta tabla guarda esa recomendacion.

Ejemplo:

```txt
App Service esta al 130% de carga.
Recomendacion: pasar de 2 a 4 instancias.
Costo extra estimado: +80 USD/mes.
```

Campos principales:

- `id`: identificador unico.
- `simulation_run_id`: corrida que genero la recomendacion.
- `project_node_id`: nodo recomendado para escalar.
- `current_instances`: instancias actuales.
- `recommended_instances`: instancias sugeridas.
- `extra_monthly_cost`: costo mensual adicional.
- `reason`: explicacion breve.
- `applied_at`: fecha en la que se aplico, si el usuario acepta la recomendacion.
- `created_at`: fecha de creacion.

Relacion importante:

- Una recomendacion pertenece a una `simulation_run`.
- Una recomendacion apunta a un `projects_node`.

## Por que se separo asi

La separacion permite que el proyecto crezca sin romper el modelo:

- `component_types` guarda el catalogo reutilizable.
- `projects_nodes` guarda los componentes reales de un proyecto.
- `projects_edges` guarda como se conectan.
- `simulation_runs` guarda cada prueba ejecutada.
- `simulation_node_metrics` guarda el detalle tecnico de cada componente.
- `scaling_recommendations` guarda acciones sugeridas para mejorar la arquitectura.

Esto evita guardar todo como un JSON gigante y permite consultar datos utiles, por ejemplo:

- Proyectos de un usuario.
- Componentes mas usados.
- Corridas con mas errores.
- Nodo mas frecuente como cuello de botella.
- Costo promedio por proyecto.
- Recomendaciones pendientes de aplicar.

## Datos iniciales

El script carga automaticamente:

- 4 categorias de componentes.
- 6 tipos de componentes.
- 4 tipos de objetivos.

No se cargaron usuarios ni proyectos de ejemplo, porque eso deberia depender del login real o de datos demo definidos por el equipo.

## Relacion con el front

El front actual trabaja principalmente con estas estructuras:

- `SimNode`
- `SimEdge`
- `NodeMetrics`
- `SimResult`
- `KIND_META`

La base de datos refleja esas estructuras:

- `SimNode` se guarda en `projects_nodes`.
- `SimEdge` se guarda en `projects_edges`.
- `NodeMetrics` se guarda en `simulation_node_metrics`.
- `SimResult` se guarda en `simulation_runs`.
- `KIND_META` se guarda en `component_types`.

Asi el front puede dejar de depender solo del estado local de React y empezar a guardar/cargar proyectos reales desde la base de datos.
