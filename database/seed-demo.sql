USE stressflow;

-- Datos de demostracion para la defensa.
-- Crea un usuario demo y tres proyectos listos para mostrar:
-- 1. arquitectura estable,
-- 2. arquitectura saturada por exceso de trafico,
-- 3. arquitectura con cuello de botella en la puerta de enlace API.
-- No reemplaza al schema.sql: primero se crea la base y despues se ejecuta este seed.

INSERT INTO usuarios (nombre, email, hash_contrasena, rol)
VALUES (
  'Usuario Demo',
  'demo@stressflow.test',
  'pbkdf2:sha256:100000:stressflowdemo:85db2910f37f75508d5474ec33c52eb425da8651ad53985303fc468fa476aaa8',
  'arquitecto'
)
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  rol = VALUES(rol);

SELECT id INTO @demo_usuario_id
FROM usuarios
WHERE email = 'demo@stressflow.test'
LIMIT 1;

INSERT INTO proyectos (usuario_id, nombre, slug, descripcion, trafico_entrante_rps, esta_ejecutando)
VALUES
  (
    @demo_usuario_id,
    'Demo estable',
    'demo-estable',
    'Arquitectura gateway -> balanceador -> app -> base con carga normal.',
    300,
    TRUE
  ),
  (
    @demo_usuario_id,
    'Demo falla por exceso',
    'demo-falla-exceso',
    'Misma arquitectura con trafico alto para mostrar saturacion y errores.',
    1800,
    TRUE
  ),
  (
    @demo_usuario_id,
    'Demo cuello de botella API',
    'demo-cuello-api',
    'Arquitectura donde el API Gateway tiene baja capacidad para mostrar cuello de botella.',
    900,
    TRUE
  )
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  descripcion = VALUES(descripcion),
  trafico_entrante_rps = VALUES(trafico_entrante_rps),
  esta_ejecutando = VALUES(esta_ejecutando);

SELECT id INTO @proyecto_estable
FROM proyectos
WHERE usuario_id = @demo_usuario_id AND slug = 'demo-estable'
LIMIT 1;

SELECT id INTO @proyecto_falla
FROM proyectos
WHERE usuario_id = @demo_usuario_id AND slug = 'demo-falla-exceso'
LIMIT 1;

SELECT id INTO @proyecto_api
FROM proyectos
WHERE usuario_id = @demo_usuario_id AND slug = 'demo-cuello-api'
LIMIT 1;

DELETE FROM conexiones_proyectos
WHERE proyecto_id IN (@proyecto_estable, @proyecto_falla, @proyecto_api);

DELETE FROM nodos_proyectos
WHERE proyecto_id IN (@proyecto_estable, @proyecto_falla, @proyecto_api);

INSERT INTO nodos_proyectos (
  proyecto_id,
  tipo_componente_id,
  nodo_cliente_id,
  nombre,
  posicion_x,
  posicion_y,
  instancias,
  capacidad_rps,
  latencia_base_ms,
  tamano_cola,
  tiempo_espera_ms,
  costo_por_instancia
)
SELECT @proyecto_estable, id, 'demo_gw', 'Puerta de enlace API', 80, 220, 2, 800, 8, 100, 2000, 25.00
FROM tipos_componentes WHERE codigo = 'puerta_enlace_api'
UNION ALL
SELECT @proyecto_estable, id, 'demo_lb', 'Balanceador de carga', 320, 220, 2, 5000, 2, 200, 1000, 18.00
FROM tipos_componentes WHERE codigo = 'balanceador_carga'
UNION ALL
SELECT @proyecto_estable, id, 'demo_app', 'Servicio de aplicacion', 580, 220, 2, 400, 35, 100, 3000, 40.00
FROM tipos_componentes WHERE codigo = 'servicio_aplicacion'
UNION ALL
SELECT @proyecto_estable, id, 'demo_db', 'Base de datos', 840, 220, 1, 600, 18, 200, 5000, 80.00
FROM tipos_componentes WHERE codigo = 'base_datos'
UNION ALL
SELECT @proyecto_falla, id, 'fail_gw', 'Puerta de enlace API', 80, 220, 2, 800, 8, 100, 2000, 25.00
FROM tipos_componentes WHERE codigo = 'puerta_enlace_api'
UNION ALL
SELECT @proyecto_falla, id, 'fail_lb', 'Balanceador de carga', 320, 220, 2, 5000, 2, 200, 1000, 18.00
FROM tipos_componentes WHERE codigo = 'balanceador_carga'
UNION ALL
SELECT @proyecto_falla, id, 'fail_app', 'Servicio de aplicacion', 580, 220, 2, 400, 35, 100, 3000, 40.00
FROM tipos_componentes WHERE codigo = 'servicio_aplicacion'
UNION ALL
SELECT @proyecto_falla, id, 'fail_db', 'Base de datos', 840, 220, 1, 600, 18, 200, 5000, 80.00
FROM tipos_componentes WHERE codigo = 'base_datos'
UNION ALL
SELECT @proyecto_api, id, 'api_gw', 'Puerta de enlace API limitada', 80, 220, 1, 500, 8, 50, 2000, 25.00
FROM tipos_componentes WHERE codigo = 'puerta_enlace_api'
UNION ALL
SELECT @proyecto_api, id, 'api_app', 'Servicio de aplicacion', 360, 220, 3, 500, 35, 100, 3000, 40.00
FROM tipos_componentes WHERE codigo = 'servicio_aplicacion'
UNION ALL
SELECT @proyecto_api, id, 'api_db', 'Base de datos', 640, 220, 2, 700, 18, 200, 5000, 80.00
FROM tipos_componentes WHERE codigo = 'base_datos';

INSERT INTO conexiones_proyectos (proyecto_id, conexion_cliente_id, nodo_origen_id, nodo_destino_id, es_asincrona)
SELECT @proyecto_estable, 'demo_e1', origen.id, destino.id, FALSE
FROM nodos_proyectos origen
JOIN nodos_proyectos destino ON destino.proyecto_id = origen.proyecto_id
WHERE origen.proyecto_id = @proyecto_estable
  AND origen.nodo_cliente_id = 'demo_gw'
  AND destino.nodo_cliente_id = 'demo_lb'
UNION ALL
SELECT @proyecto_estable, 'demo_e2', origen.id, destino.id, FALSE
FROM nodos_proyectos origen
JOIN nodos_proyectos destino ON destino.proyecto_id = origen.proyecto_id
WHERE origen.proyecto_id = @proyecto_estable
  AND origen.nodo_cliente_id = 'demo_lb'
  AND destino.nodo_cliente_id = 'demo_app'
UNION ALL
SELECT @proyecto_estable, 'demo_e3', origen.id, destino.id, FALSE
FROM nodos_proyectos origen
JOIN nodos_proyectos destino ON destino.proyecto_id = origen.proyecto_id
WHERE origen.proyecto_id = @proyecto_estable
  AND origen.nodo_cliente_id = 'demo_app'
  AND destino.nodo_cliente_id = 'demo_db'
UNION ALL
SELECT @proyecto_falla, 'fail_e1', origen.id, destino.id, FALSE
FROM nodos_proyectos origen
JOIN nodos_proyectos destino ON destino.proyecto_id = origen.proyecto_id
WHERE origen.proyecto_id = @proyecto_falla
  AND origen.nodo_cliente_id = 'fail_gw'
  AND destino.nodo_cliente_id = 'fail_lb'
UNION ALL
SELECT @proyecto_falla, 'fail_e2', origen.id, destino.id, FALSE
FROM nodos_proyectos origen
JOIN nodos_proyectos destino ON destino.proyecto_id = origen.proyecto_id
WHERE origen.proyecto_id = @proyecto_falla
  AND origen.nodo_cliente_id = 'fail_lb'
  AND destino.nodo_cliente_id = 'fail_app'
UNION ALL
SELECT @proyecto_falla, 'fail_e3', origen.id, destino.id, FALSE
FROM nodos_proyectos origen
JOIN nodos_proyectos destino ON destino.proyecto_id = origen.proyecto_id
WHERE origen.proyecto_id = @proyecto_falla
  AND origen.nodo_cliente_id = 'fail_app'
  AND destino.nodo_cliente_id = 'fail_db'
UNION ALL
SELECT @proyecto_api, 'api_e1', origen.id, destino.id, FALSE
FROM nodos_proyectos origen
JOIN nodos_proyectos destino ON destino.proyecto_id = origen.proyecto_id
WHERE origen.proyecto_id = @proyecto_api
  AND origen.nodo_cliente_id = 'api_gw'
  AND destino.nodo_cliente_id = 'api_app'
UNION ALL
SELECT @proyecto_api, 'api_e2', origen.id, destino.id, FALSE
FROM nodos_proyectos origen
JOIN nodos_proyectos destino ON destino.proyecto_id = origen.proyecto_id
WHERE origen.proyecto_id = @proyecto_api
  AND origen.nodo_cliente_id = 'api_app'
  AND destino.nodo_cliente_id = 'api_db';
