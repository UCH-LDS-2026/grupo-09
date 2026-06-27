-- Esta migracion usa la base seleccionada por el entorno. No incluye USE para evitar
-- aplicar cambios accidentalmente sobre una base distinta de DB_NAME.

CREATE TABLE IF NOT EXISTS versiones_escenarios (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  proyecto_id BIGINT UNSIGNED NOT NULL,
  creado_por_usuario_id BIGINT UNSIGNED NULL,
  nombre VARCHAR(120) NOT NULL,
  descripcion VARCHAR(500) NULL,
  snapshot_json JSON NOT NULL,
  trafico_rps INT UNSIGNED NOT NULL DEFAULT 0,
  cantidad_nodos INT UNSIGNED NOT NULL DEFAULT 0,
  latencia_promedio_ms DECIMAL(14,4) NULL,
  tasa_error DECIMAL(12,8) NULL,
  costo_mensual DECIMAL(14,2) NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY versiones_escenarios_proyecto_fecha_indice (proyecto_id, creado_en, id),
  KEY versiones_escenarios_creado_por_indice (creado_por_usuario_id),
  CONSTRAINT versiones_escenarios_proyecto_id_fk
    FOREIGN KEY (proyecto_id) REFERENCES proyectos (id)
    ON DELETE CASCADE,
  CONSTRAINT versiones_escenarios_creado_por_fk
    FOREIGN KEY (creado_por_usuario_id) REFERENCES usuarios (id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- Rollback manual seguro mientras ninguna funcionalidad dependa de las versiones:
-- DROP TABLE IF EXISTS versiones_escenarios;
