CREATE DATABASE IF NOT EXISTS softwareestres
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE softwareestres;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'architect', 'viewer') NOT NULL DEFAULT 'architect',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS projects (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  description TEXT NULL,
  incoming_traffic_rps INT UNSIGNED NOT NULL DEFAULT 600,
  is_running BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY projects_user_slug_unique (user_id, slug),
  KEY projects_user_id_index (user_id),
  CONSTRAINT projects_user_id_foreign
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS component_categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  display_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY component_categories_name_unique (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS component_types (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(60) NOT NULL,
  label VARCHAR(100) NOT NULL,
  icon VARCHAR(60) NOT NULL,
  color_token VARCHAR(80) NOT NULL,
  default_instances INT UNSIGNED NOT NULL,
  default_capacity_rps INT UNSIGNED NOT NULL,
  default_base_latency_ms INT UNSIGNED NOT NULL,
  default_queue_size INT UNSIGNED NOT NULL,
  default_timeout_ms INT UNSIGNED NOT NULL,
  default_cost_per_instance DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY component_types_code_unique (code),
  KEY component_types_category_id_index (category_id),
  CONSTRAINT component_types_category_id_foreign
    FOREIGN KEY (category_id) REFERENCES component_categories (id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS projects_nodes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  component_type_id BIGINT UNSIGNED NOT NULL,
  client_node_id VARCHAR(80) NOT NULL,
  name VARCHAR(120) NOT NULL,
  position_x DECIMAL(10,2) NOT NULL,
  position_y DECIMAL(10,2) NOT NULL,
  instances INT UNSIGNED NOT NULL,
  capacity_rps INT UNSIGNED NOT NULL,
  base_latency_ms INT UNSIGNED NOT NULL,
  queue_size INT UNSIGNED NOT NULL,
  timeout_ms INT UNSIGNED NOT NULL,
  cost_per_instance DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY projects_nodes_client_node_unique (project_id, client_node_id),
  KEY projects_nodes_project_id_index (project_id),
  KEY projects_nodes_component_type_id_index (component_type_id),
  CONSTRAINT projects_nodes_project_id_foreign
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE CASCADE,
  CONSTRAINT projects_nodes_component_type_id_foreign
    FOREIGN KEY (component_type_id) REFERENCES component_types (id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS projects_edges (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  client_edge_id VARCHAR(80) NOT NULL,
  from_node_id BIGINT UNSIGNED NOT NULL,
  to_node_id BIGINT UNSIGNED NOT NULL,
  is_async BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY projects_edges_client_edge_unique (project_id, client_edge_id),
  KEY projects_edges_project_id_index (project_id),
  KEY projects_edges_from_node_id_index (from_node_id),
  KEY projects_edges_to_node_id_index (to_node_id),
  CONSTRAINT projects_edges_project_id_foreign
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE CASCADE,
  CONSTRAINT projects_edges_from_node_id_foreign
    FOREIGN KEY (from_node_id) REFERENCES projects_nodes (id)
    ON DELETE CASCADE,
  CONSTRAINT projects_edges_to_node_id_foreign
    FOREIGN KEY (to_node_id) REFERENCES projects_nodes (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS objective_types (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(60) NOT NULL,
  label VARCHAR(100) NOT NULL,
  unit VARCHAR(30) NOT NULL,
  comparison ENUM('lte', 'gte') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY objective_types_code_unique (code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS project_objectives (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  objective_type_id BIGINT UNSIGNED NOT NULL,
  target_value DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY project_objectives_unique (project_id, objective_type_id),
  KEY project_objectives_project_id_index (project_id),
  KEY project_objectives_objective_type_id_index (objective_type_id),
  CONSTRAINT project_objectives_project_id_foreign
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE CASCADE,
  CONSTRAINT project_objectives_objective_type_id_foreign
    FOREIGN KEY (objective_type_id) REFERENCES objective_types (id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS simulation_runs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  incoming_traffic_rps INT UNSIGNED NOT NULL,
  avg_latency_ms DECIMAL(12,2) NOT NULL,
  error_rate DECIMAL(8,6) NOT NULL,
  throughput_rps DECIMAL(12,2) NOT NULL,
  monthly_cost DECIMAL(12,2) NOT NULL,
  bottleneck_node_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY simulation_runs_project_id_index (project_id),
  KEY simulation_runs_bottleneck_node_id_index (bottleneck_node_id),
  CONSTRAINT simulation_runs_project_id_foreign
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE CASCADE,
  CONSTRAINT simulation_runs_bottleneck_node_id_foreign
    FOREIGN KEY (bottleneck_node_id) REFERENCES projects_nodes (id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS simulation_node_metrics (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  simulation_run_id BIGINT UNSIGNED NOT NULL,
  project_node_id BIGINT UNSIGNED NOT NULL,
  load_ratio DECIMAL(10,6) NOT NULL,
  throughput_rps DECIMAL(12,2) NOT NULL,
  latency_ms DECIMAL(12,2) NOT NULL,
  error_rate DECIMAL(8,6) NOT NULL,
  status ENUM('healthy', 'warning', 'high_load', 'saturated', 'error') NOT NULL,
  monthly_cost DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY simulation_node_metrics_unique (simulation_run_id, project_node_id),
  KEY simulation_node_metrics_project_node_id_index (project_node_id),
  CONSTRAINT simulation_node_metrics_simulation_run_id_foreign
    FOREIGN KEY (simulation_run_id) REFERENCES simulation_runs (id)
    ON DELETE CASCADE,
  CONSTRAINT simulation_node_metrics_project_node_id_foreign
    FOREIGN KEY (project_node_id) REFERENCES projects_nodes (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS scaling_recommendations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  simulation_run_id BIGINT UNSIGNED NOT NULL,
  project_node_id BIGINT UNSIGNED NOT NULL,
  current_instances INT UNSIGNED NOT NULL,
  recommended_instances INT UNSIGNED NOT NULL,
  extra_monthly_cost DECIMAL(12,2) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  applied_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY scaling_recommendations_simulation_run_id_index (simulation_run_id),
  KEY scaling_recommendations_project_node_id_index (project_node_id),
  CONSTRAINT scaling_recommendations_simulation_run_id_foreign
    FOREIGN KEY (simulation_run_id) REFERENCES simulation_runs (id)
    ON DELETE CASCADE,
  CONSTRAINT scaling_recommendations_project_node_id_foreign
    FOREIGN KEY (project_node_id) REFERENCES projects_nodes (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO component_categories (name, display_order)
VALUES
  ('Traffic & Edge', 10),
  ('Compute', 20),
  ('Messaging', 30),
  ('Storage', 40)
ON DUPLICATE KEY UPDATE
  display_order = VALUES(display_order);

INSERT INTO component_types (
  category_id,
  code,
  label,
  icon,
  color_token,
  default_instances,
  default_capacity_rps,
  default_base_latency_ms,
  default_queue_size,
  default_timeout_ms,
  default_cost_per_instance
)
VALUES
  ((SELECT id FROM component_categories WHERE name = 'Traffic & Edge'), 'api_gateway', 'API Gateway', 'Shield', 'var(--neon-violet)', 2, 800, 8, 100, 2000, 25.00),
  ((SELECT id FROM component_categories WHERE name = 'Traffic & Edge'), 'load_balancer', 'Load Balancer', 'GitFork', 'var(--neon-cyan)', 2, 5000, 2, 200, 1000, 18.00),
  ((SELECT id FROM component_categories WHERE name = 'Compute'), 'app_service', 'App Service', 'Terminal', 'var(--neon-cyan)', 2, 400, 35, 100, 3000, 40.00),
  ((SELECT id FROM component_categories WHERE name = 'Storage'), 'cache', 'Cache', 'Gauge', 'var(--neon-pink)', 1, 8000, 1, 500, 500, 30.00),
  ((SELECT id FROM component_categories WHERE name = 'Storage'), 'database', 'Database', 'Database', 'var(--neon-amber)', 1, 600, 18, 200, 5000, 80.00),
  ((SELECT id FROM component_categories WHERE name = 'Messaging'), 'queue', 'Queue', 'Inbox', 'var(--neon-violet)', 1, 3000, 5, 1000, 10000, 20.00)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id),
  label = VALUES(label),
  icon = VALUES(icon),
  color_token = VALUES(color_token),
  default_instances = VALUES(default_instances),
  default_capacity_rps = VALUES(default_capacity_rps),
  default_base_latency_ms = VALUES(default_base_latency_ms),
  default_queue_size = VALUES(default_queue_size),
  default_timeout_ms = VALUES(default_timeout_ms),
  default_cost_per_instance = VALUES(default_cost_per_instance),
  is_active = TRUE;

UPDATE component_types
SET is_active = FALSE
WHERE code = 'cache';

INSERT INTO objective_types (code, label, unit, comparison)
VALUES
  ('max_avg_latency', 'Maximum average latency', 'ms', 'lte'),
  ('max_error_rate', 'Maximum error rate', '%', 'lte'),
  ('min_throughput', 'Minimum throughput', 'req/s', 'gte'),
  ('max_monthly_cost', 'Maximum monthly cost', 'USD/mo', 'lte')
ON DUPLICATE KEY UPDATE
  label = VALUES(label),
  unit = VALUES(unit),
  comparison = VALUES(comparison);
