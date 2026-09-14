# Contrato de persistencia de simulaciones

## Versiones de escenario

La migracion `database/migrations/007-project-scenario-versions.sql` agrega `versiones_escenarios` sobre la base seleccionada por `DB_NAME`. No incluye una sentencia `USE`, para evitar aplicar cambios en una base distinta a la configurada por el backend.

Cada fila pertenece a un proyecto y conserva:

- nombre y descripcion del punto de decision;
- autor y fecha de creacion;
- snapshot JSON completo e inmutable;
- resumen indexable de trafico, nodos, latencia, error y costo.

El snapshot usa `schemaVersion: 1`, nodos y conexiones del motor compartido, perfil de request, trafico y resultado de simulacion cuando existe. Al leerlo se vuelven a aplicar los defaults del motor para mantener compatibilidad con snapshots que no tengan campos opcionales.

## Inmutabilidad y permisos

La API solo expone crear, listar y abrir. No existen endpoints para actualizar o eliminar una version individual. Todas las operaciones validan que el usuario autenticado sea propietario del proyecto; el rol `lector` puede listar y abrir, pero no crear.

Eliminar el proyecto elimina sus versiones mediante `ON DELETE CASCADE`. Si se elimina el usuario autor, la version se conserva y `creado_por_usuario_id` pasa a `NULL`.

## Operacion

Antes de aplicar la migracion en otro entorno:

1. Confirmar `DB_NAME` y backup.
2. Verificar que las migraciones `003` a `006` esten aplicadas.
3. Ejecutar `007-project-scenario-versions.sql` sobre esa base.
4. Confirmar tabla, claves foraneas e indices.

Rollback manual, solo si ninguna funcionalidad depende de las versiones:

```sql
DROP TABLE IF EXISTS versiones_escenarios;
```
