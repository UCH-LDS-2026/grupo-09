USE softwareestres;

UPDATE component_types
SET is_active = FALSE
WHERE code = 'cache';

ALTER TABLE simulation_node_metrics
  MODIFY status ENUM('healthy', 'warning', 'high_load', 'saturated', 'error') NOT NULL;
