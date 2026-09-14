# Feature Specification: Versionado, Comparacion e Informes Stressflow

**Feature Branch**: `002-versionado-comparacion-informes`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "Planear en Spec Kit las tres mejoras de portfolio: versionado de escenarios, comparacion antes/despues e informe exportable, cuidando seguridad, arquitectura, clean code, tests y compatibilidad."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Versionar escenarios de arquitectura (Priority: P1)

Como usuario que esta analizando una arquitectura, quiero guardar una version del escenario antes de hacer cambios para poder experimentar sin perder el punto de partida.

**Why this priority**: Es la base de las otras mejoras. Sin versiones no hay comparacion confiable ni informe historico defendible.

**Independent Test**: Crear un proyecto, guardar una version inicial, modificar capacidad/instancias/bandwidth y guardar otra version. El usuario debe poder volver a ver ambas sin que una sobrescriba a la otra.

**Acceptance Scenarios**:

1. **Given** un proyecto guardado, **When** el usuario crea una nueva version, **Then** el sistema conserva un snapshot completo de nodos, conexiones, trafico, request profile y resultados calculados.
2. **Given** un proyecto con varias versiones, **When** el usuario abre el historial, **Then** ve nombre, fecha, resumen y puede seleccionar una version anterior sin destruir la actual.

---

### User Story 2 - Comparar antes y despues (Priority: P2)

Como usuario o evaluador tecnico, quiero comparar dos versiones de un escenario para entender si una mejora redujo latencia, error o saturacion y cuanto costo agrego.

**Why this priority**: Convierte el simulador en una herramienta de decision. Para portfolio, muestra criterio tecnico y producto, no solo calculos aislados.

**Independent Test**: Seleccionar dos versiones del mismo proyecto y ver diferencias de throughput, latencia, error, costo, cuello de botella y recomendacion.

**Acceptance Scenarios**:

1. **Given** dos versiones del mismo escenario, **When** el usuario las compara, **Then** el sistema muestra deltas claros para metricas principales y marca mejoras/empeoramientos.
2. **Given** versiones con cambios en nodos o conexiones, **When** se compara, **Then** el usuario ve que componentes fueron agregados, quitados o modificados.

---

### User Story 3 - Exportar informe tecnico (Priority: P3)

Como dueño del sistema o usuario de portfolio, quiero exportar un informe tecnico del escenario para compartir una decision de arquitectura de forma profesional.

**Why this priority**: Hace que Stressflow sea demostrable fuera de la UI y ayuda a defender el proyecto en entrevistas, evaluaciones o entregas academicas.

**Independent Test**: Desde un escenario o comparacion, exportar un informe que incluya inputs, arquitectura, metricas, cuello de botella, recomendacion, limitaciones del modelo y fecha.

**Acceptance Scenarios**:

1. **Given** una version simulada, **When** el usuario exporta el informe, **Then** recibe un documento legible con datos suficientes para explicar el resultado sin abrir el codigo.
2. **Given** una comparacion antes/despues, **When** se exporta, **Then** el informe incluye la diferencia de metricas y una conclusion sobre la mejora.

### Edge Cases

- Una version creada con campos futuros debe seguir cargando aunque un campo opcional falte.
- Una comparacion debe bloquear versiones de proyectos distintos para evitar resultados falsos.
- Si una version fue creada antes de guardar resultados, el sistema debe recalcular o marcar que falta simulacion.
- Si el informe no puede generarse, el usuario debe conservar el escenario y ver un error recuperable.
- Las versiones no deben exponer datos de otros usuarios ni permitir acceso por URL sin autorizacion.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir crear una version nombrada de un proyecto existente sin reemplazar el estado actual.
- **FR-002**: Cada version MUST conservar snapshot completo de arquitectura, configuracion de trafico, perfil de request, bandwidth por nodo y resultado de simulacion disponible.
- **FR-003**: El sistema MUST listar versiones de un proyecto con fecha, nombre, resumen y autor cuando esa informacion exista.
- **FR-004**: El sistema MUST permitir restaurar o abrir una version en modo lectura antes de convertirla en estado actual.
- **FR-005**: El sistema MUST comparar dos versiones del mismo proyecto y mostrar diferencias de latencia, throughput, error, costo, trafico de red y cuello de botella.
- **FR-006**: El sistema MUST mostrar cambios estructurales entre versiones: nodos agregados, quitados y modificados, y conexiones agregadas o quitadas.
- **FR-007**: El sistema MUST exportar un informe tecnico legible desde una version individual o una comparacion.
- **FR-008**: El informe MUST incluir inputs principales, resultado, causa de cuello de botella, recomendacion, fecha y limitaciones honestas del modelo.
- **FR-009**: Las operaciones de versionado, comparacion e informe MUST respetar autenticacion, autorizacion por proyecto y protecciones CSRF existentes.
- **FR-010**: El sistema MUST mantener compatibilidad con proyectos existentes que no tengan versiones previas, creando una version inicial cuando el usuario lo solicite.
- **FR-011**: El plan MUST definir migraciones reversibles o seguras antes de tocar tablas nuevas.
- **FR-012**: Cada historia funcional MUST incluir tests unitarios o de integracion proporcionales al riesgo.

### Key Entities *(include if feature involves data)*

- **ScenarioVersion**: Snapshot nombrado de un proyecto en un momento determinado. Incluye arquitectura, inputs, resultados, autor y timestamps.
- **VersionComparison**: Resultado derivado al comparar dos versiones del mismo proyecto. Incluye deltas numericos y cambios estructurales.
- **TechnicalReport**: Documento exportable basado en una version o comparacion. Incluye datos, conclusion y limitaciones.
- **VersionSnapshot**: Representacion inmutable de nodos, conexiones, trafico, perfil de request y metricas calculadas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede crear dos versiones y volver a abrir cada una en menos de 2 minutos desde un proyecto existente.
- **SC-002**: Una comparacion muestra al menos 6 deltas principales: latencia, throughput, error, costo, trafico de red y cuello de botella.
- **SC-003**: El informe exportado permite explicar el escenario sin abrir la app ni leer codigo en al menos 90% de los casos de demo preparados.
- **SC-004**: Los proyectos existentes sin versiones siguen cargando y simulando sin cambios visibles para el usuario.
- **SC-005**: Tests, build, lint y auditoria de dependencias pasan antes de cerrar cada historia implementada.

## Assumptions

- El versionado pertenece al usuario autenticado propietario del proyecto.
- La primera entrega puede guardar snapshots dentro de MySQL; no requiere almacenamiento externo de archivos.
- El informe inicial puede ser HTML imprimible o descargable antes de incorporar PDF si eso reduce riesgo.
- La comparacion se limita a versiones del mismo proyecto para mantener semantica clara.
- No se agregan dependencias nuevas para exportacion sin aprobacion explicita.
