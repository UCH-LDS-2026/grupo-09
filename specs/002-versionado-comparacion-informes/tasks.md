# Tasks: Versionado, Comparacion e Informes Stressflow

**Input**: Design documents from `/specs/002-versionado-comparacion-informes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, `docs/frontend-ui-ux-audit.md`

**Tests**: Tests are required for each functional story because the feature touches persistence, authorization, simulation contracts and user-facing output. UI/UX changes also require responsive/manual QA and, when approved, browser E2E evidence.

**Organization**: Tasks are grouped by user story and by one shared UI/UX gate so Spec Kit, Codex and sub-agents work from the same source of truth.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare persistence, UX and contract groundwork before user-story implementation.

- [ ] T001 Review `docs/database-migration-status.md` against the target environment before creating new migrations
- [ ] T002 [P] Review `backend/src/routes/index.js` and choose route namespace for versions/reports
- [ ] T003 [P] Review `src/services/projectService.ts` and decide frontend service boundaries for versioning/comparison/reporting
- [ ] T004 [P] Review `shared/simulator-core.js` and confirm comparison helpers do not duplicate simulation formulas

---

## Phase 2: UI/UX Foundation Gate (Blocking Prerequisite)

**Purpose**: Unify the experience model before adding versioning, comparison and reports.

**CRITICAL**: Do this before implementing new feature UI so the product does not become a set of disconnected panels.

- [ ] T005 Review `docs/frontend-ui-ux-audit.md` and confirm the shared experience direction
- [ ] T006 [P] Define the workspace shell: action bar plus contextual tabs in `src/components/SimulatorDashboard.tsx`
- [ ] T007 [P] Define shared UI building blocks for executive summary, metric deltas, structural changes and model limitations in `src/components/simulator/`
- [ ] T008 [P] Add standard empty/loading/error/success/unauthorized/stale simulation states in `src/components/SimulatorDashboard.tsx`
- [ ] T009 [P] Add accessible labels and keyboard affordances for icon-only/canvas controls in `src/components/SimulatorDashboard.tsx`
- [ ] T010 [P] Add reduced-motion rules for flow/glow/blink animations in `src/styles.css`
- [ ] T011 Add confirmation UX for destructive actions in `src/components/SimulatorDashboard.tsx`
- [ ] T012 Add confirmation UX for deleting selected components in `src/components/simulator/PropertiesPanel.tsx`
- [ ] T013 Convert traffic controls from hover-first panel to always-discoverable scenario controls in `src/components/SimulatorDashboard.tsx`
- [ ] T014 Add demo scenario entry point in `src/components/SimulatorDashboard.tsx`
- [ ] T015 Normalize visible technical terminology in `src/components/simulator/PropertiesPanel.tsx` and `src/components/simulator/SystemConclusion.tsx`
- [ ] T016 Document manual QA screenshots checklist in `docs/frontend-ui-ux-audit.md`

**Checkpoint**: The current simulator is easier to demo and ready to receive versioning/comparison/report UI.

---

## Phase 3: Foundational Persistence and Contracts (Blocking Prerequisite)

**Purpose**: Add schema and shared validation foundation used by all feature stories.

- [ ] T017 Create migration for scenario versions in `database/migrations/007-project-scenario-versions.sql`
- [ ] T018 Update base schema in `database/schema.sql` with scenario version table after migration design is accepted
- [ ] T019 Add version snapshot validation/default helpers in `backend/src/services/projects.service.js` or a focused service module
- [ ] T020 Add frontend/backend type contract for version snapshots in `src/services/projectService.ts`
- [ ] T021 [P] Add migration/schema documentation in `docs/simulation-persistence-contract.md`

**Checkpoint**: Persistence shape is ready and compatible before user stories.

---

## Phase 4: User Story 1 - Versionar escenarios de arquitectura (Priority: P1) MVP

**Goal**: Users can save and reopen immutable versions of a project.

**Independent Test**: Create two versions from one project, change the current project between them, and verify both versions preserve their own snapshots.

### Tests for User Story 1

- [ ] T022 [P] [US1] Add unit tests for snapshot defaults and immutability in `tests/unitarios.test.ts`
- [ ] T023 [P] [US1] Add integration tests for create/list/get version flow in `tests/integracion.test.ts`

### Implementation for User Story 1

- [ ] T024 [US1] Implement version persistence service in `backend/src/services/project-versions.service.js`
- [ ] T025 [US1] Implement version controller in `backend/src/controllers/project-versions.controller.js`
- [ ] T026 [US1] Implement version routes in `backend/src/routes/project-versions.routes.js`
- [ ] T027 [US1] Register version routes in `backend/src/routes/index.js`
- [ ] T028 [US1] Add frontend version service methods in `src/services/projectService.ts`
- [ ] T029 [US1] Add version history UI in `src/components/simulator/VersionHistoryPanel.tsx`
- [ ] T030 [US1] Integrate save/open version controls into the `Escenario` shell in `src/components/SimulatorDashboard.tsx`

**Checkpoint**: Versionado works without comparison or export.

---

## Phase 5: User Story 2 - Comparar antes y despues (Priority: P2)

**Goal**: Users can compare two versions and understand metric/structure deltas.

**Independent Test**: Compare baseline and optimized versions and verify deltas for metrics and changed nodes/connections.

### Tests for User Story 2

- [ ] T031 [P] [US2] Add unit tests for metric and structural deltas in `tests/unitarios.test.ts`
- [ ] T032 [P] [US2] Add integration tests blocking cross-project comparisons in `tests/integracion.test.ts`

### Implementation for User Story 2

- [ ] T033 [US2] Add shared comparison helper in `shared/simulator-core.js` only if reused by frontend and backend
- [ ] T034 [US2] Export comparison helper types in `shared/simulator-core.d.ts`
- [ ] T035 [US2] Implement backend comparison flow in `backend/src/services/project-versions.service.js`
- [ ] T036 [US2] Add frontend comparison method in `src/services/projectService.ts`
- [ ] T037 [US2] Add comparison UI in `src/components/simulator/ScenarioComparisonPanel.tsx`
- [ ] T038 [US2] Integrate comparison selection into the `Escenario` shell in `src/components/SimulatorDashboard.tsx`

**Checkpoint**: Comparacion works without report export.

---

## Phase 6: User Story 3 - Exportar informe tecnico (Priority: P3)

**Goal**: Users can generate a professional technical report from a version or comparison.

**Independent Test**: Export an HTML/printable report from a version and from a comparison; both include inputs, results, recommendation and limitations.

### Tests for User Story 3

- [ ] T039 [P] [US3] Add unit tests for report data assembly in `tests/unitarios.test.ts`
- [ ] T040 [P] [US3] Add integration tests for authorization and report generation in `tests/integracion.test.ts`

### Implementation for User Story 3

- [ ] T041 [US3] Implement report assembly service in `backend/src/services/project-reports.service.js`
- [ ] T042 [US3] Implement report controller in `backend/src/controllers/project-reports.controller.js`
- [ ] T043 [US3] Implement report routes in `backend/src/routes/project-reports.routes.js`
- [ ] T044 [US3] Add frontend report service method in `src/services/projectService.ts`
- [ ] T045 [US3] Add printable report view in `src/components/simulator/TechnicalReportView.tsx`
- [ ] T046 [US3] Add report action into the `Entrega` shell in `src/components/SimulatorDashboard.tsx`

**Checkpoint**: Report export works from existing version/comparison data.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Validate, document and prepare portfolio presentation.

- [ ] T047 [P] Update `README.md` with screenshots/feature summary after implementation
- [ ] T048 [P] Update `docs/roadmap.md` marking completed stories and next recommendations
- [ ] T049 [P] Update `docs/simulation-model.md` if comparison/report wording exposes model details
- [ ] T050 Run `npm test` in repository root
- [ ] T051 Run `npm run build` in repository root
- [ ] T052 Run `npm run lint` in repository root
- [ ] T053 Run `npm run security:audit` in repository root
- [ ] T054 Run browser/manual QA checklist from `docs/frontend-ui-ux-audit.md`
- [ ] T055 Review `git diff` and confirm no unrelated files changed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **UI/UX Foundation Gate (Phase 2)**: Depends on Setup and blocks new feature UI.
- **Foundational Persistence (Phase 3)**: Depends on Setup and `T003`; can run after UX direction is accepted.
- **US1 Versionado**: First functional MVP; requires Phase 2 and Phase 3.
- **US2 Comparacion**: Depends on saved versions from US1.
- **US3 Informe**: Can export a single version after US1, but comparison reports depend on US2.
- **Polish**: Run after desired stories are implemented.

### Parallel Opportunities / Agent Split

- **UX Agent - Experience/UI**: T007-T016, T029-T030, T037-T038, T045-T046, T054.
- **Backend Agent - Persistence/API**: T017-T019, T024-T027, T035, T041-T043.
- **Frontend Agent - Services/Integration**: T020, T028, T036, T044.
- **QA Agent - Tests/Docs**: T021-T023, T031-T032, T039-T040, T047-T055.

## Implementation Strategy

### MVP First

1. Complete Setup.
2. Complete UI/UX Foundation Gate.
3. Complete Foundational Persistence.
4. Implement US1 Versionado only.
5. Validate independently with tests/build/lint/audit and manual UI checklist.
6. Stop for review before US2.

### Incremental Delivery

1. UX Foundation: shell, demo, confirmations, accessibility, responsive direction.
2. US1: Versionado.
3. US2: Comparacion.
4. US3: Informe exportable.
5. Polish: portfolio docs, screenshots and final validation.

### Stop Conditions

- Stop before adding a new dependency for PDF/export or browser E2E.
- Stop before applying migrations to a non-local DB without confirming `DB_NAME` and backups.
- Stop if comparison would require duplicating simulator formulas outside `shared/simulator-core.js`.
- Stop if any route exposes versions/reports without project ownership checks.
- Stop if new UI adds hidden hover-only controls for primary flows.
