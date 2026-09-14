# Feature Specification: Roadmap de Modernizacion Stressflow

**Feature Branch**: `001-roadmap-modernizacion`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "Instalar Spec Kit, revisar Stressflow, entender donde estamos parados, completar la planificacion con vision de usuario y dueño, cuidar seguridad/arquitectura/clean code/tests, y avanzar por fases sin romper lo existente."

## Stakeholder Vision

### Vision del usuario final

El usuario quiere dibujar una arquitectura distribuida, ajustar parametros entendibles y recibir una respuesta clara: donde se satura, por que se satura, que costo tiene y que cambio podria mejorar el escenario. No necesita precision de produccion; necesita una herramienta educativa y defendible para comparar decisiones temprano.

### Vision del dueño del sistema

El dueño necesita un proyecto presentable, mantenible y seguro para portfolio o evaluacion tecnica. El sistema debe mostrar criterio de arquitectura, separacion de responsabilidades, pruebas, documentacion honesta y seguridad basica sin prometer mas de lo que hace.

### Vision del mantenedor/desarrollador

El mantenedor necesita que cada mejora tenga alcance acotado, contratos claros entre frontend/backend/base de datos/motor compartido, defaults compatibles y tests que detecten regresiones. La fuente de verdad de simulacion debe seguir siendo `shared/simulator-core.js`.

### Vision de seguridad y publicacion

El repositorio debe poder publicarse sin secretos, con `.env.example` seguros, auditorias limpias, dependencias justificadas y sin subir estado privado de herramientas. Cualquier cambio de auth, cookies, CORS, CSRF, rate limit o persistencia debe tratarse como cambio sensible.

## Current Functional State

Stressflow tiene hoy:

- Canvas para componer arquitecturas con API gateway, balanceador, servicios, cache, base de datos y cola.
- Validacion de conexiones, bloqueo de ciclos y grafo dirigido aciclico.
- Motor de simulacion compartido para RPS, capacidad, throughput, colas, errores, latencia, costo, cuello de botella, request size y bandwidth.
- Persistencia en MySQL de proyectos, nodos, conexiones, perfil de request y ancho de banda.
- Frontend React/TypeScript/Vite y backend Node/Express con separacion por rutas, controladores, servicios, middlewares y configuracion.
- Seguridad base: CORS configurado, headers de seguridad, rate limit, cookie session, CSRF para mutaciones y validacion de payloads.
- Tests Vitest unitarios e integracion del simulador/autenticacion/reglas de negocio.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Priorizar mejoras futuras (Priority: P1)

Como owner del proyecto, quiero una lista priorizada de mejoras futuras basada en el estado real del repositorio para decidir que fase implementar primero sin romper lo que ya funciona.

**Why this priority**: Evita reimplementar trabajo ya hecho y ordena el proyecto para subirlo a un repositorio profesional.

**Independent Test**: Leer `docs/roadmap.md` y `tasks.md` debe alcanzar para saber que existe, que sigue y que queda fuera de alcance.

**Acceptance Scenarios**:

1. **Given** el repo actual con tests/build/lint/audit en verde, **When** se revisa el plan, **Then** las mejoras aparecen como fases futuras sin cambios funcionales no aprobados.
2. **Given** una mejora ya implementada en el codigo, **When** se revisa el backlog, **Then** esa mejora figura como actual o como documentacion pendiente, no como implementacion faltante.

---

### User Story 2 - Preparar el repo para publicacion (Priority: P2)

Como dueño del sistema, quiero que el repositorio sea seguro y entendible antes de subirlo para no exponer secretos ni mostrar documentacion contradictoria.

**Why this priority**: Publicar un repo con secretos, docs viejas o estado privado de herramientas perjudica seguridad y credibilidad.

**Independent Test**: Revisar `.gitignore`, `.env.example`, `backend/.env.example`, auditorias npm y documentacion debe confirmar que no hay secretos y que el alcance esta bien explicado.

**Acceptance Scenarios**:

1. **Given** el repo listo para publicar, **When** se revisa `.gitignore`, **Then** los env reales y estados privados quedan ignorados.
2. **Given** la vision de producto, **When** se lee `docs/product-vision.md`, **Then** no debe decir que bandwidth/request size faltan si ya estan implementados.

---

### User Story 3 - Mejorar explicabilidad del simulador (Priority: P3)

Como estudiante, entrevistador o reviewer tecnico, quiero entender por que el simulador reporta latencia, saturacion, error, throughput y cuello de botella para poder defender los resultados.

**Why this priority**: El producto tiene valor educativo; la confianza depende de que las metricas sean explicables y consistentes entre UI, docs y tests.

**Independent Test**: Ejecutar un escenario gateway -> app -> database y explicar cada metrica principal desde UI/docs sin leer el codigo.

**Acceptance Scenarios**:

1. **Given** un nodo cerca de saturacion, **When** se ejecuta la simulacion, **Then** la latencia debe crecer de forma continua y documentada.
2. **Given** un nodo saturado por bandwidth, **When** se revisa el panel de resultados, **Then** la UI debe distinguir bandwidth de RPS.

---

### User Story 4 - Alinear contratos y persistencia (Priority: P4)

Como desarrollador del proyecto, quiero que frontend, backend, base de datos y motor compartido usen contratos claros para evitar regresiones al agregar nuevas dimensiones de simulacion.

**Why this priority**: El proyecto cruza varias capas. Cualquier campo nuevo debe mantenerse compatible con proyectos guardados y con endpoints existentes.

**Independent Test**: Guardar/cargar un proyecto antiguo y uno nuevo, incluyendo defaults de campos agregados, debe funcionar sin errores.

**Acceptance Scenarios**:

1. **Given** un proyecto guardado sin campos nuevos, **When** se carga, **Then** se aplican defaults sin crashear.
2. **Given** una simulacion enviada al backend, **When** el payload se normaliza, **Then** el resultado coincide con el motor local para el mismo grafo.

### Edge Cases

- El roadmap original contiene fases ya implementadas parcialmente; el nuevo backlog debe tratarlas como completadas o como ajuste de documentacion.
- El usuario pidio avanzar con conciencia; no se deben mezclar cambios funcionales grandes con documentacion y seguridad de publicacion.
- Si una mejora requiere dependencia nueva, la tarea debe pedir aprobacion antes de instalarla.
- Si una decision rompe compatibilidad de proyectos guardados, endpoints o seguridad, la fase debe detenerse y pedir aprobacion.
- Si una auditoria de seguridad falla, la publicacion del repo debe quedar bloqueada hasta resolver o justificar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El plan MUST registrar la linea base actual de tests, build, lint y auditoria antes de proponer mejoras.
- **FR-002**: El backlog MUST priorizar mejoras futuras sin tocar codigo funcional fuera de la fase aprobada.
- **FR-003**: El plan MUST reconocer que request size, bandwidth por nodo y saturacion por bandwidth ya estan implementados en el motor y tests.
- **FR-004**: El plan MUST incluir una fase para preparar el repositorio para publicacion segura.
- **FR-005**: El plan MUST incluir una fase para latencia progresiva con formula simple, testeable y documentada.
- **FR-006**: El plan MUST incluir una fase para mejorar explicabilidad de resultados y cuello de botella.
- **FR-007**: El plan MUST incluir validaciones de compatibilidad para proyectos guardados.
- **FR-008**: Cada tarea MUST nombrar archivos reales del repositorio cuando aplique.
- **FR-009**: El plan MUST mantener implementacion fuera de alcance hasta aprobacion explicita de una fase.

### Non-Functional Requirements

- **NFR-001 Security**: El repo MUST ignorar env reales, secretos, builds, dependencias y estado privado de herramientas.
- **NFR-002 Architecture**: Las reglas de simulacion MUST vivir en el motor compartido y no duplicarse en UI/backend.
- **NFR-003 Clean Code**: Cada fase MUST evitar abstracciones nuevas si no reducen complejidad real.
- **NFR-004 Testing**: Cambios funcionales MUST incluir tests proporcionales al riesgo y correr `npm test`, `npm run build`, `npm run lint`.
- **NFR-005 Dependency Hygiene**: Nuevas dependencias MUST ser aprobadas y pasar auditoria.
- **NFR-006 Documentation Honesty**: La documentacion MUST separar claramente MVP actual, proximo, futuro y fuera de alcance.

### Key Entities *(include if feature involves data)*

- **RoadmapPhase**: Fase futura con objetivo, valor, riesgos, criterios de aceptacion y tareas.
- **StakeholderView**: Perspectiva de usuario final, dueño, mantenedor y seguridad/publicacion.
- **SimulationMetric**: Resultado explicable de simulacion, como RPS, MB/s, latencia, error, costo o cuello de botella.
- **CompatibilityDefault**: Valor usado para cargar proyectos antiguos sin campos nuevos.
- **ValidationBaseline**: Resultado de comandos antes de modificar codigo.
- **RepositoryReadinessCheck**: Verificacion de seguridad/documentacion antes de publicar.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El plan identifica al menos 4 fases futuras independientes y ordenadas por prioridad.
- **SC-002**: El backlog incluye tareas con paths reales para motor, frontend, backend, docs, seguridad y tests donde corresponda.
- **SC-003**: La revision registra resultados reales de `npm test`, `npm run build`, `npm run lint` y `npm run security:audit`.
- **SC-004**: Ningun archivo funcional de `src/`, `backend/`, `shared/`, `database` o `tests` se modifica durante fases de planificacion/publicacion.
- **SC-005**: Las mejoras propuestas tienen criterios de validacion ejecutables antes de implementarse.
- **SC-006**: La documentacion publica no contiene afirmaciones obsoletas sobre funcionalidades ya implementadas.

## Assumptions

- La mejora de bandwidth/request size ya pertenece al estado actual y no debe reimplementarse.
- El stack actual se conserva: React, TypeScript, Vite, Node.js, Express, MySQL, Vitest.
- La publicacion del repo se hara sin archivos `.env` reales ni estado privado de agentes.
- La implementacion funcional futura se hara por fases separadas y revisables.
