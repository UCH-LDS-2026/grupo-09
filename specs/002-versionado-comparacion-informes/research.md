# Research: Versionado, Comparacion e Informes Stressflow

## Decision: Guardar versiones como snapshots inmutables

**Rationale**: El usuario necesita comparar decisiones historicas. Un snapshot evita que cambios futuros de nodos o defaults modifiquen el pasado.

**Alternatives considered**:
- Solo duplicar proyectos completos: simple, pero mezcla versionado con entidad principal y hace comparacion menos clara.
- Guardar solo diferencias: eficiente, pero demasiado complejo para el alcance de portfolio.

## Decision: Comparacion derivada entre dos snapshots del mismo proyecto

**Rationale**: Mantiene la semantica clara y evita comparar arquitecturas que no comparten contexto. Los deltas se calculan desde metricas guardadas o recalculadas con el motor compartido.

**Alternatives considered**:
- Comparar cualquier proyecto con cualquier otro: flexible, pero confuso para usuarios y mas riesgoso en permisos.
- Comparar solo metricas globales: rapido, pero no explica cambios estructurales.

## Decision: Informe inicial como HTML imprimible/exportable

**Rationale**: Evita dependencias nuevas y permite validar valor de portfolio rapidamente. El PDF puede venir despues si el usuario lo aprueba.

**Alternatives considered**:
- PDF server-side desde el inicio: mas profesional, pero agrega dependencia y superficie de seguridad.
- Imagen del canvas solamente: vistoso, pero insuficiente para defender decisiones tecnicas.

## Decision: Cerrar migraciones locales antes de planificar persistencia

**Rationale**: Versionado requiere tablas nuevas o snapshots persistidos. Confirmar el estado local reduce riesgo de romper datos existentes.

**Alternatives considered**:
- Crear migraciones directamente: mas rapido, pero contradice la constitucion y `T008`.
