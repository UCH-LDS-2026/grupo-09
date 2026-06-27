# Implementation Plan: Versionado, Comparacion e Informes Stressflow

**Branch**: `002-versionado-comparacion-informes` | **Date**: 2026-06-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-versionado-comparacion-informes/spec.md`

## Summary

Planificar tres mejoras de alto impacto para portfolio: versionado de escenarios, comparacion antes/despues e informe tecnico exportable. La estrategia es entregar primero snapshots persistidos y compatibles, luego comparacion derivada sin duplicar formulas del motor, y finalmente exportacion sin dependencias nuevas salvo aprobacion.

## Technical Context

**Language/Version**: TypeScript 5.8, JavaScript modules, Node >=22.12.0

**Primary Dependencies**: React 19, Vite 8, TanStack Router/Start, Express 5, mysql2, Vitest 4, ESLint 9

**Storage**: MySQL 8 mediante `backend/src/config/database.js`

**Testing**: Vitest en `tests/unitarios.test.ts` y `tests/integracion.test.ts`; posible Playwright/E2E solo si se aprueba dependencia o entorno existente

**Target Platform**: Aplicacion web local con frontend, backend API y MySQL

**Project Type**: Brownfield web application con motor de simulacion compartido

**Performance Goals**: Crear/listar versiones en flujo interactivo normal; comparacion instantanea para escenarios actuales de <=40 nodos y <=80 conexiones

**Constraints**: No romper proyectos existentes; no duplicar reglas de simulacion fuera de `shared/simulator-core.js`; no agregar dependencia para PDF sin aprobacion; mantener controles auth/CSRF/rate limit

**Scale/Scope**: Portfolio educativo, no sistema de auditoria empresarial ni almacenamiento masivo de historicos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Planificacion Antes de Implementacion**: PASS. Esta fase solo genera plan y tareas.
- **Motor Compartido como Fuente de Verdad**: PASS. Versiones guardan snapshots; comparacion usa resultados del motor, no formulas nuevas duplicadas.
- **Compatibilidad Hacia Atras**: PASS con condicion. `T008` fue cerrado para base local; cualquier migracion nueva debe incluir defaults y validacion previa en entorno objetivo.
- **Tests y Linea Base Verificable**: PASS. La fase exige tests por historia y validacion completa.
- **Cambios Acotados y Defendibles**: PASS. Las tres mejoras se dividen en historias independientes.

## Project Structure

### Documentation (this feature)

```text
specs/002-versionado-comparacion-informes/
├── spec.md
├── checklists/
│   └── requirements.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── versioning-comparison-report-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
shared/
├── simulator-core.js
└── simulator-core.d.ts

src/
├── components/
│   └── simulator/
├── services/
│   └── projectService.ts
└── views/
    └── simulator/

backend/
└── src/
    ├── controllers/
    ├── routes/
    └── services/

database/
├── schema.sql
└── migrations/

docs/
└── database-migration-status.md

tests/
├── unitarios.test.ts
└── integracion.test.ts
```

**Structure Decision**: Mantener la estructura actual. Las nuevas reglas compartidas o helpers de comparacion deben vivir cerca del motor compartido solo si se reutilizan entre frontend y backend. Servicios HTTP y persistencia siguen el patron existente de routes/controllers/services.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
