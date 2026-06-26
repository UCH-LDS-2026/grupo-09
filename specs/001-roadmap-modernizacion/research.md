# Research: Roadmap de Modernizacion Stressflow

## Decision: Treat bandwidth/request size as completed baseline

**Rationale**: `shared/simulator-core.js`, `shared/simulator-core.d.ts`,
`src/components/SimulatorDashboard.tsx`, `src/components/simulator/PropertiesPanel.tsx`,
`backend/src/services/projects.service.js`, `backend/src/services/simulations.service.js` and
tests already support request profiles and bandwidth saturation.

**Alternatives considered**:

- Re-plan bandwidth as future work: rejected because it would duplicate implemented behavior.
- Remove it from roadmap entirely: rejected because documentation alignment and regression coverage
  remain useful follow-up work.

## Decision: Prioritize continuous latency next

**Rationale**: `calculateLatency()` still uses discrete thresholds. A continuous curve is a contained
change in the shared engine with clear tests and visible educational value.

**Alternatives considered**:

- Model queueing theory in detail: rejected as too complex for the product scope.
- Keep threshold latency forever: rejected because it creates abrupt jumps that are harder to explain
  and less realistic near saturation.

## Decision: Add explainability before adding more simulation dimensions

**Rationale**: The simulator already computes many useful metrics. Users need clearer reasons for
results before the model gains CPU/memory/retry complexity.

**Alternatives considered**:

- Add CPU/memory next: rejected because it increases model surface before current outputs are fully
  explained.
- Add charts first: rejected because charts without clear reasons can make results look precise beyond
  the intended educational scope.

## Decision: Keep future work contract-first

**Rationale**: The same field travels through UI state, frontend DTO mapping, backend DTO mapping,
database columns, shared normalizers and tests. A small contract checklist prevents drift.

**Alternatives considered**:

- Rely on manual implementation review only: rejected because the project already has multiple mapping
  layers.
- Introduce OpenAPI immediately: deferred until API surface grows or contract tests need stronger
  tooling.

## Decision: Update documentation as a required phase

**Rationale**: `docs/product-vision.md` still lists bandwidth and request size as not modeled, while
the code now models them. Portfolio documentation must reflect current behavior and limits.

**Alternatives considered**:

- Leave docs until the end: rejected because stale docs can mislead planning and demos.
- Rewrite all docs now: rejected because this task is planning-only.

## Decision: Add repository readiness before functional latency work

**Rationale**: The user intends to publish the repository. Before changing simulator behavior, the repo should have honest docs, safe ignore rules, clean audits and explicit stakeholder goals. This is lower risk and improves presentation quality immediately.

**Alternatives considered**:

- Start continuous latency immediately: deferred because documentation/security readiness is a prerequisite for public presentation.
- Perform a large security refactor: rejected because current baseline already has CORS, headers, rate limit, cookie auth and CSRF; a broad refactor would exceed this phase.
