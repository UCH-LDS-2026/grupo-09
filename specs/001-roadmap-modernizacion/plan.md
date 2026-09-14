# Implementation Plan: Roadmap de Modernizacion Stressflow

**Branch**: `001-roadmap-modernizacion` | **Date**: 2026-06-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-roadmap-modernizacion/spec.md`

## Summary

Stressflow already has a healthy baseline and several roadmap items implemented: request size,
bandwidth per node, bandwidth saturation, persistence fields and tests. The next work should be a
non-destructive, phase-based modernization plan focused on latencia progresiva, explicability,
contract hardening and documentation alignment.

## Technical Context

**Language/Version**: TypeScript 5.8, JavaScript modules, Node 24.16.0 locally; package engines require Node >=22.12.0

**Primary Dependencies**: React 19, Vite 8, TanStack Router/Start, Express 5, mysql2, Vitest 4, ESLint 9

**Storage**: MySQL 8 via `backend/src/config/database.js`

**Testing**: Vitest for root unit/integration tests; backend has no separate test script today

**Target Platform**: Web application with local frontend, backend API and MySQL

**Project Type**: Brownfield web application with shared simulation engine

**Performance Goals**: Preserve current build/test speed; simulation remains instant for <=40 nodes and <=80 edges

**Constraints**: No functional code modification in this planning phase; no new dependencies without approval; maintain backward compatibility for saved projects

**Scale/Scope**: Educational architecture simulator, not a production load-testing or cloud-pricing engine

## Baseline Review

Commands executed on 2026-06-26:

- `npm test`: passed, 2 test files, 25 tests
- `npm run build`: passed, Vite client and SSR builds completed
- `npm run lint`: passed
- `npm run security:audit`: passed, frontend/backend production audits found 0 vulnerabilities

Current findings:

- The simulator already includes `averageRequestSizeKb`, `heavyRequestPercentage`,
  `heavyRequestSizeKb`, `bandwidthMbps`, MB/s/Mbps calculations and `saturationReason`.
- Unit tests already cover uniform/heavy request size, RPS saturation, bandwidth saturation and
  backward-compatible defaults.
- `docs/simulation-model.md` documents request size and bandwidth correctly.
- `docs/product-vision.md` still says bandwidth/request size are not modeled in the current state,
  which is now stale.
- `calculateLatency()` still uses step thresholds (`base`, `1.5x`, `2x`, `3x`), so the roadmap
  phase for continuous latency remains useful.
- Frontend and backend both map DTO fields manually; future additions should be planned as
  contract changes to prevent drift.
- Security baseline exists: configured CORS, security headers, API rate limit, login/register rate
  limits, cookie session auth and CSRF checks for cookie-based mutations.
- `.env.example` and `backend/.env.example` contain placeholders only; `.gitignore` should protect
  local env files and private agent state before publication.

## Stakeholder and Quality Goals

- **Usuario final**: understand architecture trade-offs without reading source code.
- **Dueño del sistema**: publish a credible portfolio project with honest scope and no secrets.
- **Mantenedor**: keep simulation rules centralized, typed and regression-tested.
- **Seguridad**: preserve CORS, CSRF, rate limit, secure headers and dependency audit discipline.
- **Arquitectura/Clean Code**: keep current MVC backend and shared-engine boundary; avoid new
  patterns unless they reduce real duplication or risk.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Planificacion Antes de Implementacion**: PASS. This phase creates docs/specs only.
- **Motor Compartido como Fuente de Verdad**: PASS. Future simulation changes target
  `shared/simulator-core.js` first.
- **Compatibilidad Hacia Atras**: PASS. All future phases include defaults and saved-project checks.
- **Tests y Linea Base Verificable**: PASS. Baseline commands were executed and recorded.
- **Cambios Acotados y Defendibles**: PASS. Tasks are grouped by independently reviewable phases.
- **Repository readiness**: PASS after ignoring private agent state while keeping Spec Kit skills versioned.

## Project Structure

### Documentation (this feature)

```text
specs/001-roadmap-modernizacion/
├── spec.md
├── checklists/
│   └── requirements.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── future-change-contracts.md
└── tasks.md
```

### Source Code (repository root)

```text
shared/
├── simulator-core.js
└── simulator-core.d.ts

src/
├── components/
│   ├── SimulatorDashboard.tsx
│   └── simulator/
├── lib/
│   └── simulator.ts
└── services/

backend/
└── src/
    ├── controllers/
    ├── routes/
    ├── services/
    └── middlewares/

database/
├── schema.sql
└── migrations/

docs/
├── product-vision.md
├── roadmap.md
├── simulation-model.md
└── technical-decisions.md

tests/
├── unitarios.test.ts
└── integracion.test.ts
```

**Structure Decision**: Keep the current frontend/backend/shared layout. Do not introduce a new
package boundary unless a future phase proves that the shared simulator needs separate publishing.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design and Contracts

Design artifacts:

- [data-model.md](./data-model.md): planning entities and compatibility concepts.
- [contracts/future-change-contracts.md](./contracts/future-change-contracts.md): rules for future
  simulation, persistence and documentation changes.
- [quickstart.md](./quickstart.md): validation guide for this planning phase and future phases.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
