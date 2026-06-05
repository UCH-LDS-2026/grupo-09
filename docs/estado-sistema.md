# Estado del sistema

## Qué está funcionando

- Frontend React con dashboard del simulador.
- Backend Express con endpoints de proyectos.
- MySQL para persistir usuarios demo, proyectos, nodos y conexiones.
- Guardado y carga de proyectos desde el frontend.
- Conexiones dirigidas entre nodos.
- Reglas de conexión del MVP.
- Motor de simulación por 6 ciclos discretos.
- Métricas de simulación por nodo y globales.
- Conclusión automática.
- Migración para desactivar `cache`.
- Validación backend de nodos, conexiones, duplicados, ciclos y tipos permitidos.
- Reglas de simulación y conexión centralizadas para frontend y backend.
- Endpoint backend de simulación.
- Headers mínimos de seguridad.
- Rate limit simple para `/api`.

## Qué falta

### Producto

- Agregar tests automatizados.
- Documentar demo final en README.
- Mejorar mensajes de error de backend en la UI.

### Frontend

- Separar más el canvas si el dashboard vuelve a crecer.
- Agregar más validaciones visuales para casos límite.
- Revisar responsive en pantallas chicas.
- Agregar estados de carga más claros en guardado/carga.

### Backend

- Agregar tests de endpoints.
- Mantener límite de tamaño de payload y revisarlo si crece el modelo.
- Revisar CORS por entorno.
- Evaluar si conviene reemplazar el validador compartido actual por Zod/Joi en una etapa posterior.

### Base de datos

- El modelo está bien para MVP.
- `cache` queda inactivo, no borrado, para no romper compatibilidad.
- Las tablas de simulación están preparadas pero todavía no se usan desde API.
- Cuando se implemente simulación persistida, habrá que guardar corridas reales.

## Seguridad

Estado actual: suficiente para MVP local, no suficiente para producción.

Riesgos actuales:

- Usuario MVP fijo en frontend.
- No hay autenticación real.
- No hay tokens ni sesiones backend.
- La API confía en `userEmail` recibido por query/body.
- Las reglas de conexión están centralizadas para frontend y backend.
- Hay rate limit simple en memoria.
- Falta autenticación real y autorización por token.

Mejoras recomendadas:

- Agregar autenticación real en fase posterior.
- Usar password hashing si se habilita login.
- Restringir CORS por variable de entorno.
- Ocultar detalles internos de error en producción.

## Escalabilidad

Para MVP está bien.

Limitaciones:

- Simulación corre en frontend.
- No hay jobs ni historial persistido.
- No hay paginación avanzada de proyectos.
- No hay cacheo ni observabilidad.

Mejoras futuras:

- Endpoint de simulación backend.
- Guardar corridas.
- Paginación de proyectos.
- Logs estructurados.
- Métricas de API.
- Tests de performance básicos para payloads grandes.

## Base de datos

Tengo acceso al script y también se verificó una base local previamente.

Archivos importantes:

- `database/schema.sql`
- `database/migrations/001-align-user-roles.sql`
- `database/migrations/002-mvp-component-cleanup.sql`

Si levantás una base nueva:

1. Ejecutar `database/schema.sql`.
2. Ejecutar migraciones en orden.

Si ya tenés base existente:

1. Ejecutar sólo migraciones pendientes.
2. Confirmar que `component_types.cache.is_active = 0`.
