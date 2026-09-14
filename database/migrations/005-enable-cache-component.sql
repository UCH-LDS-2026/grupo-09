USE stressflow;

UPDATE tipos_componentes
SET activo = TRUE
WHERE codigo = 'cache';
