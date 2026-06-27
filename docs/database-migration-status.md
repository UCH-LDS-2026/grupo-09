# Estado de migraciones de base de datos

Verificacion realizada el 2026-06-26 contra la base local configurada por `backend/src/config/env.js`.

## Resultado

La base local activa responde como `softwareestres`. Aunque los archivos de migracion contienen `USE stressflow`, el backend local apunta a la base configurada por variables de entorno. Para otros entornos, antes de aplicar cambios de persistencia hay que confirmar que `DB_NAME` coincida con la base objetivo o ajustar el `USE` de las migraciones manuales.

| Migracion | Evidencia verificada | Estado local |
|---|---|---|
| `003-drop-unused-mvp-tables.sql` | Tablas antiguas `scaling_recommendations`, `simulation_node_metrics`, `simulation_runs`, `project_objectives`, `objective_types` ausentes | Aplicada |
| `004-normalizar-nombres-espanol.sql` | Tablas `usuarios`, `proyectos`, `categorias_componentes`, `tipos_componentes`, `nodos_proyectos`, `conexiones_proyectos` presentes | Aplicada |
| `005-enable-cache-component.sql` | Tipo `cache` existe y esta activo en `tipos_componentes` | Aplicada |
| `006-request-size-bandwidth.sql` | Columnas `average_request_size_kb`, `heavy_request_percentage`, `heavy_request_size_kb`, `ancho_banda_mbps` presentes | Aplicada |

## Comando de verificacion usado

Se consulto MySQL usando el mismo pool del backend, sin imprimir credenciales:

```bash
node --input-type=module
```

La consulta valido `information_schema.tables`, `information_schema.columns` y el estado del componente `cache`.

## Decision

`T008` queda cerrado para el entorno local. Para produccion o una base remota, repetir esta verificacion antes de crear migraciones nuevas o tocar versionado de escenarios.
