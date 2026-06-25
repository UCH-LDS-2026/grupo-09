USE stressflow;

-- Normaliza nombres fisicos de la base al espanol.
-- Preserva los datos existentes y actualiza indices, claves foraneas y valores semilla.

ALTER TABLE projects_edges DROP FOREIGN KEY projects_edges_from_node_id_foreign;
ALTER TABLE projects_edges DROP FOREIGN KEY projects_edges_to_node_id_foreign;
ALTER TABLE projects_edges DROP FOREIGN KEY projects_edges_project_id_foreign;
ALTER TABLE projects_nodes DROP FOREIGN KEY projects_nodes_component_type_id_foreign;
ALTER TABLE projects_nodes DROP FOREIGN KEY projects_nodes_project_id_foreign;
ALTER TABLE component_types DROP FOREIGN KEY component_types_category_id_foreign;
ALTER TABLE projects DROP FOREIGN KEY projects_user_id_foreign;

ALTER TABLE users DROP INDEX users_email_unique;
ALTER TABLE projects DROP INDEX projects_user_slug_unique;
ALTER TABLE projects DROP INDEX projects_user_id_index;
ALTER TABLE component_categories DROP INDEX component_categories_name_unique;
ALTER TABLE component_types DROP INDEX component_types_code_unique;
ALTER TABLE component_types DROP INDEX component_types_category_id_index;
ALTER TABLE projects_nodes DROP INDEX projects_nodes_client_node_unique;
ALTER TABLE projects_nodes DROP INDEX projects_nodes_project_id_index;
ALTER TABLE projects_nodes DROP INDEX projects_nodes_component_type_id_index;
ALTER TABLE projects_edges DROP INDEX projects_edges_client_edge_unique;
ALTER TABLE projects_edges DROP INDEX projects_edges_project_id_index;
ALTER TABLE projects_edges DROP INDEX projects_edges_from_node_id_index;
ALTER TABLE projects_edges DROP INDEX projects_edges_to_node_id_index;

RENAME TABLE
  users TO usuarios,
  projects TO proyectos,
  component_categories TO categorias_componentes,
  component_types TO tipos_componentes,
  projects_nodes TO nodos_proyectos,
  projects_edges TO conexiones_proyectos;

ALTER TABLE usuarios
  CHANGE name nombre VARCHAR(120) NOT NULL,
  CHANGE password_hash hash_contrasena VARCHAR(255) NOT NULL,
  CHANGE role rol VARCHAR(20) NOT NULL DEFAULT 'arquitecto',
  CHANGE created_at creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHANGE updated_at actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

UPDATE usuarios
SET rol = CASE rol
  WHEN 'admin' THEN 'administrador'
  WHEN 'architect' THEN 'arquitecto'
  WHEN 'viewer' THEN 'lector'
  ELSE rol
END;

ALTER TABLE usuarios
  MODIFY rol ENUM('administrador', 'arquitecto', 'lector') NOT NULL DEFAULT 'arquitecto',
  ADD UNIQUE KEY usuarios_email_unico (email);

ALTER TABLE proyectos
  CHANGE user_id usuario_id BIGINT UNSIGNED NOT NULL,
  CHANGE name nombre VARCHAR(160) NOT NULL,
  CHANGE description descripcion TEXT NULL,
  CHANGE incoming_traffic_rps trafico_entrante_rps INT UNSIGNED NOT NULL DEFAULT 600,
  CHANGE is_running esta_ejecutando BOOLEAN NOT NULL DEFAULT TRUE,
  CHANGE created_at creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHANGE updated_at actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD UNIQUE KEY proyectos_usuario_slug_unico (usuario_id, slug),
  ADD KEY proyectos_usuario_id_indice (usuario_id),
  ADD CONSTRAINT proyectos_usuario_id_fk
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON DELETE CASCADE;

ALTER TABLE categorias_componentes
  CHANGE name nombre VARCHAR(80) NOT NULL,
  CHANGE display_order orden_visualizacion INT UNSIGNED NOT NULL DEFAULT 0,
  CHANGE created_at creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD UNIQUE KEY categorias_componentes_nombre_unico (nombre);

UPDATE categorias_componentes
SET nombre = CASE nombre
  WHEN 'Traffic & Edge' THEN 'Trafico y borde'
  WHEN 'Compute' THEN 'Computo'
  WHEN 'Messaging' THEN 'Mensajeria'
  WHEN 'Storage' THEN 'Almacenamiento'
  ELSE nombre
END;

ALTER TABLE tipos_componentes
  CHANGE category_id categoria_id BIGINT UNSIGNED NOT NULL,
  CHANGE code codigo VARCHAR(60) NOT NULL,
  CHANGE label etiqueta VARCHAR(100) NOT NULL,
  CHANGE icon icono VARCHAR(60) NOT NULL,
  CHANGE color_token token_color VARCHAR(80) NOT NULL,
  CHANGE default_instances instancias_predeterminadas INT UNSIGNED NOT NULL,
  CHANGE default_capacity_rps capacidad_predeterminada_rps INT UNSIGNED NOT NULL,
  CHANGE default_base_latency_ms latencia_base_predeterminada_ms INT UNSIGNED NOT NULL,
  CHANGE default_queue_size tamano_cola_predeterminado INT UNSIGNED NOT NULL,
  CHANGE default_timeout_ms tiempo_espera_predeterminado_ms INT UNSIGNED NOT NULL,
  CHANGE default_cost_per_instance costo_por_instancia_predeterminado DECIMAL(10,2) NOT NULL,
  CHANGE is_active activo BOOLEAN NOT NULL DEFAULT TRUE,
  CHANGE created_at creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHANGE updated_at actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

UPDATE tipos_componentes
SET
  codigo = CASE codigo
    WHEN 'api_gateway' THEN 'puerta_enlace_api'
    WHEN 'load_balancer' THEN 'balanceador_carga'
    WHEN 'app_service' THEN 'servicio_aplicacion'
    WHEN 'database' THEN 'base_datos'
    WHEN 'queue' THEN 'cola'
    ELSE codigo
  END,
  etiqueta = CASE etiqueta
    WHEN 'API Gateway' THEN 'Puerta de enlace API'
    WHEN 'Load Balancer' THEN 'Balanceador de carga'
    WHEN 'App Service' THEN 'Servicio de aplicacion'
    WHEN 'Database' THEN 'Base de datos'
    WHEN 'Queue' THEN 'Cola'
    ELSE etiqueta
  END;

ALTER TABLE tipos_componentes
  ADD UNIQUE KEY tipos_componentes_codigo_unico (codigo),
  ADD KEY tipos_componentes_categoria_id_indice (categoria_id),
  ADD CONSTRAINT tipos_componentes_categoria_id_fk
    FOREIGN KEY (categoria_id) REFERENCES categorias_componentes (id)
    ON DELETE RESTRICT;

ALTER TABLE nodos_proyectos
  CHANGE project_id proyecto_id BIGINT UNSIGNED NOT NULL,
  CHANGE component_type_id tipo_componente_id BIGINT UNSIGNED NOT NULL,
  CHANGE client_node_id nodo_cliente_id VARCHAR(80) NOT NULL,
  CHANGE name nombre VARCHAR(120) NOT NULL,
  CHANGE position_x posicion_x DECIMAL(10,2) NOT NULL,
  CHANGE position_y posicion_y DECIMAL(10,2) NOT NULL,
  CHANGE instances instancias INT UNSIGNED NOT NULL,
  CHANGE capacity_rps capacidad_rps INT UNSIGNED NOT NULL,
  CHANGE base_latency_ms latencia_base_ms INT UNSIGNED NOT NULL,
  CHANGE queue_size tamano_cola INT UNSIGNED NOT NULL,
  CHANGE timeout_ms tiempo_espera_ms INT UNSIGNED NOT NULL,
  CHANGE cost_per_instance costo_por_instancia DECIMAL(10,2) NOT NULL,
  CHANGE created_at creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHANGE updated_at actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD UNIQUE KEY nodos_proyectos_nodo_cliente_unico (proyecto_id, nodo_cliente_id),
  ADD KEY nodos_proyectos_proyecto_id_indice (proyecto_id),
  ADD KEY nodos_proyectos_tipo_componente_id_indice (tipo_componente_id),
  ADD CONSTRAINT nodos_proyectos_proyecto_id_fk
    FOREIGN KEY (proyecto_id) REFERENCES proyectos (id)
    ON DELETE CASCADE,
  ADD CONSTRAINT nodos_proyectos_tipo_componente_id_fk
    FOREIGN KEY (tipo_componente_id) REFERENCES tipos_componentes (id)
    ON DELETE RESTRICT;

ALTER TABLE conexiones_proyectos
  CHANGE project_id proyecto_id BIGINT UNSIGNED NOT NULL,
  CHANGE client_edge_id conexion_cliente_id VARCHAR(80) NOT NULL,
  CHANGE from_node_id nodo_origen_id BIGINT UNSIGNED NOT NULL,
  CHANGE to_node_id nodo_destino_id BIGINT UNSIGNED NOT NULL,
  CHANGE is_async es_asincrona BOOLEAN NOT NULL DEFAULT FALSE,
  CHANGE created_at creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD UNIQUE KEY conexiones_proyectos_conexion_cliente_unico (proyecto_id, conexion_cliente_id),
  ADD KEY conexiones_proyectos_proyecto_id_indice (proyecto_id),
  ADD KEY conexiones_proyectos_nodo_origen_id_indice (nodo_origen_id),
  ADD KEY conexiones_proyectos_nodo_destino_id_indice (nodo_destino_id),
  ADD CONSTRAINT conexiones_proyectos_proyecto_id_fk
    FOREIGN KEY (proyecto_id) REFERENCES proyectos (id)
    ON DELETE CASCADE,
  ADD CONSTRAINT conexiones_proyectos_nodo_origen_id_fk
    FOREIGN KEY (nodo_origen_id) REFERENCES nodos_proyectos (id)
    ON DELETE CASCADE,
  ADD CONSTRAINT conexiones_proyectos_nodo_destino_id_fk
    FOREIGN KEY (nodo_destino_id) REFERENCES nodos_proyectos (id)
    ON DELETE CASCADE;
