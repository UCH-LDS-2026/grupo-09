USE softwareestres;

-- Datos de demostracion para la defensa.
-- Crea un usuario demo y tres proyectos listos para mostrar:
-- 1. arquitectura estable,
-- 2. arquitectura saturada por exceso de trafico,
-- 3. arquitectura con cuello de botella en la puerta de enlace API.
-- No reemplaza al schema.sql: primero se crea la base y despues se ejecuta este seed.

INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Usuario Demo',
  'demo@softwareestres.test',
  'pbkdf2:sha256:100000:softwareestresdemo:85db2910f37f75508d5474ec33c52eb425da8651ad53985303fc468fa476aaa8',
  'architect'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  role = VALUES(role);

SELECT id INTO @demo_user_id
FROM users
WHERE email = 'demo@softwareestres.test'
LIMIT 1;

INSERT INTO projects (user_id, name, slug, description, incoming_traffic_rps, is_running)
VALUES
  (
    @demo_user_id,
    'Demo estable',
    'demo-estable',
    'Arquitectura gateway -> balanceador -> app -> base con carga normal.',
    300,
    TRUE
  ),
  (
    @demo_user_id,
    'Demo falla por exceso',
    'demo-falla-exceso',
    'Misma arquitectura con trafico alto para mostrar saturacion y errores.',
    1800,
    TRUE
  ),
  (
    @demo_user_id,
    'Demo cuello de botella API',
    'demo-cuello-api',
    'Arquitectura donde el API Gateway tiene baja capacidad para mostrar cuello de botella.',
    900,
    TRUE
  )
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  incoming_traffic_rps = VALUES(incoming_traffic_rps),
  is_running = VALUES(is_running);

SELECT id INTO @project_stable
FROM projects
WHERE user_id = @demo_user_id AND slug = 'demo-estable'
LIMIT 1;

SELECT id INTO @project_failure
FROM projects
WHERE user_id = @demo_user_id AND slug = 'demo-falla-exceso'
LIMIT 1;

SELECT id INTO @project_api
FROM projects
WHERE user_id = @demo_user_id AND slug = 'demo-cuello-api'
LIMIT 1;

DELETE FROM projects_edges
WHERE project_id IN (@project_stable, @project_failure, @project_api);

DELETE FROM projects_nodes
WHERE project_id IN (@project_stable, @project_failure, @project_api);

INSERT INTO projects_nodes (
  project_id,
  component_type_id,
  client_node_id,
  name,
  position_x,
  position_y,
  instances,
  capacity_rps,
  base_latency_ms,
  queue_size,
  timeout_ms,
  cost_per_instance
)
SELECT @project_stable, id, 'demo_gw', 'Puerta de enlace API', 80, 220, 2, 800, 8, 100, 2000, 25.00
FROM component_types WHERE code = 'api_gateway'
UNION ALL
SELECT @project_stable, id, 'demo_lb', 'Balanceador de carga', 320, 220, 2, 5000, 2, 200, 1000, 18.00
FROM component_types WHERE code = 'load_balancer'
UNION ALL
SELECT @project_stable, id, 'demo_app', 'Servicio de aplicacion', 580, 220, 2, 400, 35, 100, 3000, 40.00
FROM component_types WHERE code = 'app_service'
UNION ALL
SELECT @project_stable, id, 'demo_db', 'Base de datos', 840, 220, 1, 600, 18, 200, 5000, 80.00
FROM component_types WHERE code = 'database'
UNION ALL
SELECT @project_failure, id, 'fail_gw', 'Puerta de enlace API', 80, 220, 2, 800, 8, 100, 2000, 25.00
FROM component_types WHERE code = 'api_gateway'
UNION ALL
SELECT @project_failure, id, 'fail_lb', 'Balanceador de carga', 320, 220, 2, 5000, 2, 200, 1000, 18.00
FROM component_types WHERE code = 'load_balancer'
UNION ALL
SELECT @project_failure, id, 'fail_app', 'Servicio de aplicacion', 580, 220, 2, 400, 35, 100, 3000, 40.00
FROM component_types WHERE code = 'app_service'
UNION ALL
SELECT @project_failure, id, 'fail_db', 'Base de datos', 840, 220, 1, 600, 18, 200, 5000, 80.00
FROM component_types WHERE code = 'database'
UNION ALL
SELECT @project_api, id, 'api_gw', 'Puerta de enlace API limitada', 80, 220, 1, 500, 8, 50, 2000, 25.00
FROM component_types WHERE code = 'api_gateway'
UNION ALL
SELECT @project_api, id, 'api_app', 'Servicio de aplicacion', 360, 220, 3, 500, 35, 100, 3000, 40.00
FROM component_types WHERE code = 'app_service'
UNION ALL
SELECT @project_api, id, 'api_db', 'Base de datos', 640, 220, 2, 700, 18, 200, 5000, 80.00
FROM component_types WHERE code = 'database';

INSERT INTO projects_edges (project_id, client_edge_id, from_node_id, to_node_id, is_async)
SELECT @project_stable, 'demo_e1', source.id, target.id, FALSE
FROM projects_nodes source
JOIN projects_nodes target ON target.project_id = source.project_id
WHERE source.project_id = @project_stable
  AND source.client_node_id = 'demo_gw'
  AND target.client_node_id = 'demo_lb'
UNION ALL
SELECT @project_stable, 'demo_e2', source.id, target.id, FALSE
FROM projects_nodes source
JOIN projects_nodes target ON target.project_id = source.project_id
WHERE source.project_id = @project_stable
  AND source.client_node_id = 'demo_lb'
  AND target.client_node_id = 'demo_app'
UNION ALL
SELECT @project_stable, 'demo_e3', source.id, target.id, FALSE
FROM projects_nodes source
JOIN projects_nodes target ON target.project_id = source.project_id
WHERE source.project_id = @project_stable
  AND source.client_node_id = 'demo_app'
  AND target.client_node_id = 'demo_db'
UNION ALL
SELECT @project_failure, 'fail_e1', source.id, target.id, FALSE
FROM projects_nodes source
JOIN projects_nodes target ON target.project_id = source.project_id
WHERE source.project_id = @project_failure
  AND source.client_node_id = 'fail_gw'
  AND target.client_node_id = 'fail_lb'
UNION ALL
SELECT @project_failure, 'fail_e2', source.id, target.id, FALSE
FROM projects_nodes source
JOIN projects_nodes target ON target.project_id = source.project_id
WHERE source.project_id = @project_failure
  AND source.client_node_id = 'fail_lb'
  AND target.client_node_id = 'fail_app'
UNION ALL
SELECT @project_failure, 'fail_e3', source.id, target.id, FALSE
FROM projects_nodes source
JOIN projects_nodes target ON target.project_id = source.project_id
WHERE source.project_id = @project_failure
  AND source.client_node_id = 'fail_app'
  AND target.client_node_id = 'fail_db'
UNION ALL
SELECT @project_api, 'api_e1', source.id, target.id, FALSE
FROM projects_nodes source
JOIN projects_nodes target ON target.project_id = source.project_id
WHERE source.project_id = @project_api
  AND source.client_node_id = 'api_gw'
  AND target.client_node_id = 'api_app'
UNION ALL
SELECT @project_api, 'api_e2', source.id, target.id, FALSE
FROM projects_nodes source
JOIN projects_nodes target ON target.project_id = source.project_id
WHERE source.project_id = @project_api
  AND source.client_node_id = 'api_app'
  AND target.client_node_id = 'api_db';
