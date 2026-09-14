USE stressflow;

-- Limpieza de tablas que no usa el MVP actual.
-- El backend, frontend, tests y seed no consultan ni escriben estas tablas.
-- Se eliminan en orden por sus claves foraneas para evitar errores.

DROP TABLE IF EXISTS scaling_recommendations;
DROP TABLE IF EXISTS simulation_node_metrics;
DROP TABLE IF EXISTS simulation_runs;
DROP TABLE IF EXISTS project_objectives;
DROP TABLE IF EXISTS objective_types;
