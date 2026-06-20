CREATE DATABASE IF NOT EXISTS softwareestres
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE softwareestres;

CREATE TABLE IF NOT EXISTS usuarios (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  hash_contrasena VARCHAR(255) NOT NULL,
  rol ENUM('administrador', 'arquitecto', 'lector') NOT NULL DEFAULT 'arquitecto',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY usuarios_email_unico (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS proyectos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id BIGINT UNSIGNED NOT NULL,
  nombre VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  descripcion TEXT NULL,
  trafico_entrante_rps INT UNSIGNED NOT NULL DEFAULT 600,
  esta_ejecutando BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY proyectos_usuario_slug_unico (usuario_id, slug),
  KEY proyectos_usuario_id_indice (usuario_id),
  CONSTRAINT proyectos_usuario_id_fk
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categorias_componentes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(80) NOT NULL,
  orden_visualizacion INT UNSIGNED NOT NULL DEFAULT 0,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY categorias_componentes_nombre_unico (nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tipos_componentes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  categoria_id BIGINT UNSIGNED NOT NULL,
  codigo VARCHAR(60) NOT NULL,
  etiqueta VARCHAR(100) NOT NULL,
  icono VARCHAR(60) NOT NULL,
  token_color VARCHAR(80) NOT NULL,
  instancias_predeterminadas INT UNSIGNED NOT NULL,
  capacidad_predeterminada_rps INT UNSIGNED NOT NULL,
  latencia_base_predeterminada_ms INT UNSIGNED NOT NULL,
  tamano_cola_predeterminado INT UNSIGNED NOT NULL,
  tiempo_espera_predeterminado_ms INT UNSIGNED NOT NULL,
  costo_por_instancia_predeterminado DECIMAL(10,2) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY tipos_componentes_codigo_unico (codigo),
  KEY tipos_componentes_categoria_id_indice (categoria_id),
  CONSTRAINT tipos_componentes_categoria_id_fk
    FOREIGN KEY (categoria_id) REFERENCES categorias_componentes (id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS nodos_proyectos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  proyecto_id BIGINT UNSIGNED NOT NULL,
  tipo_componente_id BIGINT UNSIGNED NOT NULL,
  nodo_cliente_id VARCHAR(80) NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  posicion_x DECIMAL(10,2) NOT NULL,
  posicion_y DECIMAL(10,2) NOT NULL,
  instancias INT UNSIGNED NOT NULL,
  capacidad_rps INT UNSIGNED NOT NULL,
  latencia_base_ms INT UNSIGNED NOT NULL,
  tamano_cola INT UNSIGNED NOT NULL,
  tiempo_espera_ms INT UNSIGNED NOT NULL,
  costo_por_instancia DECIMAL(10,2) NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY nodos_proyectos_nodo_cliente_unico (proyecto_id, nodo_cliente_id),
  KEY nodos_proyectos_proyecto_id_indice (proyecto_id),
  KEY nodos_proyectos_tipo_componente_id_indice (tipo_componente_id),
  CONSTRAINT nodos_proyectos_proyecto_id_fk
    FOREIGN KEY (proyecto_id) REFERENCES proyectos (id)
    ON DELETE CASCADE,
  CONSTRAINT nodos_proyectos_tipo_componente_id_fk
    FOREIGN KEY (tipo_componente_id) REFERENCES tipos_componentes (id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS conexiones_proyectos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  proyecto_id BIGINT UNSIGNED NOT NULL,
  conexion_cliente_id VARCHAR(80) NOT NULL,
  nodo_origen_id BIGINT UNSIGNED NOT NULL,
  nodo_destino_id BIGINT UNSIGNED NOT NULL,
  es_asincrona BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY conexiones_proyectos_conexion_cliente_unico (proyecto_id, conexion_cliente_id),
  KEY conexiones_proyectos_proyecto_id_indice (proyecto_id),
  KEY conexiones_proyectos_nodo_origen_id_indice (nodo_origen_id),
  KEY conexiones_proyectos_nodo_destino_id_indice (nodo_destino_id),
  CONSTRAINT conexiones_proyectos_proyecto_id_fk
    FOREIGN KEY (proyecto_id) REFERENCES proyectos (id)
    ON DELETE CASCADE,
  CONSTRAINT conexiones_proyectos_nodo_origen_id_fk
    FOREIGN KEY (nodo_origen_id) REFERENCES nodos_proyectos (id)
    ON DELETE CASCADE,
  CONSTRAINT conexiones_proyectos_nodo_destino_id_fk
    FOREIGN KEY (nodo_destino_id) REFERENCES nodos_proyectos (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO categorias_componentes (nombre, orden_visualizacion)
VALUES
  ('Trafico y borde', 10),
  ('Computo', 20),
  ('Mensajeria', 30),
  ('Almacenamiento', 40)
ON DUPLICATE KEY UPDATE
  orden_visualizacion = VALUES(orden_visualizacion);

INSERT INTO tipos_componentes (
  categoria_id,
  codigo,
  etiqueta,
  icono,
  token_color,
  instancias_predeterminadas,
  capacidad_predeterminada_rps,
  latencia_base_predeterminada_ms,
  tamano_cola_predeterminado,
  tiempo_espera_predeterminado_ms,
  costo_por_instancia_predeterminado
)
VALUES
  ((SELECT id FROM categorias_componentes WHERE nombre = 'Trafico y borde'), 'puerta_enlace_api', 'Puerta de enlace API', 'Shield', 'var(--neon-violet)', 2, 800, 8, 100, 2000, 25.00),
  ((SELECT id FROM categorias_componentes WHERE nombre = 'Trafico y borde'), 'balanceador_carga', 'Balanceador de carga', 'GitFork', 'var(--neon-cyan)', 2, 5000, 2, 200, 1000, 18.00),
  ((SELECT id FROM categorias_componentes WHERE nombre = 'Computo'), 'servicio_aplicacion', 'Servicio de aplicacion', 'Terminal', 'var(--neon-cyan)', 2, 400, 35, 100, 3000, 40.00),
  ((SELECT id FROM categorias_componentes WHERE nombre = 'Almacenamiento'), 'cache', 'Cache', 'Gauge', 'var(--neon-pink)', 1, 8000, 1, 500, 500, 30.00),
  ((SELECT id FROM categorias_componentes WHERE nombre = 'Almacenamiento'), 'base_datos', 'Base de datos', 'Database', 'var(--neon-amber)', 1, 600, 18, 200, 5000, 80.00),
  ((SELECT id FROM categorias_componentes WHERE nombre = 'Mensajeria'), 'cola', 'Cola', 'Inbox', 'var(--neon-violet)', 1, 3000, 5, 1000, 10000, 20.00)
ON DUPLICATE KEY UPDATE
  categoria_id = VALUES(categoria_id),
  etiqueta = VALUES(etiqueta),
  icono = VALUES(icono),
  token_color = VALUES(token_color),
  instancias_predeterminadas = VALUES(instancias_predeterminadas),
  capacidad_predeterminada_rps = VALUES(capacidad_predeterminada_rps),
  latencia_base_predeterminada_ms = VALUES(latencia_base_predeterminada_ms),
  tamano_cola_predeterminado = VALUES(tamano_cola_predeterminado),
  tiempo_espera_predeterminado_ms = VALUES(tiempo_espera_predeterminado_ms),
  costo_por_instancia_predeterminado = VALUES(costo_por_instancia_predeterminado),
  activo = TRUE;

UPDATE tipos_componentes
SET activo = TRUE
WHERE codigo = 'cache';
