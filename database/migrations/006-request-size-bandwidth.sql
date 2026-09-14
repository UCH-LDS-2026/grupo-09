USE stressflow;

ALTER TABLE proyectos
  ADD COLUMN average_request_size_kb DECIMAL(10,2) NOT NULL DEFAULT 5.00 AFTER trafico_entrante_rps,
  ADD COLUMN heavy_request_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER average_request_size_kb,
  ADD COLUMN heavy_request_size_kb DECIMAL(10,2) NOT NULL DEFAULT 50.00 AFTER heavy_request_percentage;

ALTER TABLE nodos_proyectos
  ADD COLUMN ancho_banda_mbps DECIMAL(10,2) NOT NULL DEFAULT 100.00 AFTER costo_por_instancia;

UPDATE nodos_proyectos pn
INNER JOIN tipos_componentes tc ON tc.id = pn.tipo_componente_id
SET pn.ancho_banda_mbps = CASE tc.codigo
  WHEN 'puerta_enlace_api' THEN 1000.00
  WHEN 'balanceador_carga' THEN 1000.00
  WHEN 'servicio_aplicacion' THEN 100.00
  WHEN 'cache' THEN 500.00
  WHEN 'base_datos' THEN 200.00
  WHEN 'cola' THEN 100.00
  ELSE 100.00
END;
