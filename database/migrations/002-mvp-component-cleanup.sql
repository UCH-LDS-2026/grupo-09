USE softwareestres;

UPDATE component_types
SET is_active = FALSE
WHERE code = 'cache';
