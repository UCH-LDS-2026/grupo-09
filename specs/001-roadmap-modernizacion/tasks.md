# Tasks: Roadmap de Modernizacion Stressflow

**Input**: Design documents from `/specs/001-roadmap-modernizacion/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are required for future functional phases. This planning phase itself does not change functional code.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each future phase.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare Spec Kit planning artifacts and preserve current project state.

- [x] T001 Review `.specify/memory/constitution.md` with the team and approve or amend governance
- [x] T002 [P] Review `specs/001-roadmap-modernizacion/spec.md` for scope and priorities
- [x] T003 [P] Review `specs/001-roadmap-modernizacion/plan.md` baseline findings against current repo
- [x] T004 Run `git status --short` and confirm only planning artifacts are changed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish validation and contract discipline before future user-story work.

**CRITICAL**: No functional phase should start until this phase is accepted.

- [x] T005 Confirm baseline commands in repository root: `npm test`, `npm run build`, `npm run lint`
- [x] T006 [P] Document accepted next phase in `docs/roadmap.md` after user approval
- [x] T007 [P] Compare `docs/product-vision.md` with `shared/simulator-core.js` and list stale claims before editing docs
- [ ] T008 Confirm whether database migrations in `database/migrations/` are already applied in the target environment before any persistence change

**Checkpoint**: Foundation ready - future user story implementation can start one phase at a time.

---

## Phase 3: User Story 1 - Priorizar mejoras futuras (Priority: P1) MVP

**Goal**: Keep a clear, executable backlog based on current repo reality.

**Independent Test**: A reviewer can read this file and choose one next phase without needing new discovery.

### Implementation for User Story 1

- [x] T009 [US1] Mark bandwidth/request-size roadmap items as completed/current in `docs/roadmap.md`
- [x] T010 [US1] Add "Latencia progresiva" as the next recommended phase in `docs/roadmap.md`
- [x] T011 [US1] Add "Explicabilidad de resultados" as a separate future phase in `docs/roadmap.md`
- [x] T012 [US1] Add "Contratos de simulacion/persistencia" as a separate future phase in `docs/roadmap.md`

**Checkpoint**: Roadmap reflects what is implemented, next, future and out of scope.


---

## Phase 3A: Repository Readiness - Seguridad y publicacion (Priority: P2)

**Goal**: Make the repository safe and credible before publishing.

**Independent Test**: A reviewer can inspect `.gitignore`, env examples, docs and audit output without finding secrets or stale claims.

### Implementation for Repository Readiness

- [x] T012A [P] [US2] Verify `.env.example` and `backend/.env.example` use placeholders only
- [x] T012B [P] [US2] Run `npm run security:audit` and confirm frontend/backend production audits pass
- [x] T012C [US2] Protect private agent state in `.gitignore` while keeping `.agents/skills/` versioned
- [x] T012D [US2] Update stale bandwidth/request-size limitation in `docs/product-vision.md`
- [x] T012E [US2] Extend Spec Kit artifacts with stakeholder, security, architecture, clean-code and testing criteria

**Checkpoint**: Repo is safer to publish and planning artifacts describe stakeholder expectations.

---

## Phase 4: User Story 2 - Mejorar explicabilidad del simulador (Priority: P3)

**Goal**: Make simulator outputs easier to trust and defend.

**Independent Test**: Run a simple gateway -> app -> database scenario and explain each major metric from UI/docs.

### Tests for User Story 2

- [x] T013 [P] [US2] Add latency curve unit tests in `tests/unitarios.test.ts`
- [x] T014 [P] [US2] Add bottleneck/explanation integration coverage in `tests/integracion.test.ts`

### Implementation for User Story 2

- [x] T015 [US2] Replace threshold latency with a continuous formula in `shared/simulator-core.js`
- [x] T016 [US2] Update the latency contract in `shared/simulator-core.d.ts` if return shape or helper names change
- [ ] T017 [US2] Surface clearer bottleneck and saturation explanation in `src/components/simulator/SystemConclusion.tsx`
- [ ] T018 [US2] Ensure node result labels in `src/components/simulator/PropertiesPanel.tsx` distinguish RPS, MB/s and Mbps
- [x] T019 [US2] Document the final latency formula in `docs/simulation-model.md`

**Checkpoint**: Latency behavior is continuous, tested and documented.

---

## Phase 5: User Story 3 - Alinear contratos y persistencia (Priority: P3)

**Goal**: Prevent drift across UI, API, database and shared engine for future fields.

**Independent Test**: Save/load an old-style project and a new project, then compare local and backend simulation outputs.

### Tests for User Story 3

- [x] T020 [P] [US3] Add saved-project default coverage in `tests/unitarios.test.ts`
- [x] T021 [P] [US3] Add backend/local simulation equivalence scenario in `tests/integracion.test.ts`

### Implementation for User Story 3

- [x] T022 [US3] Audit DTO mappings in `src/services/projectService.ts`
- [x] T023 [US3] Audit payload normalization in `backend/src/services/projects.service.js`
- [x] T024 [US3] Audit simulation payload mapping in `backend/src/services/simulations.service.js`
- [x] T025 [US3] Verify schema/migrations in `database/schema.sql` and `database/migrations/`
- [x] T026 [US3] Document any accepted contract rules in `docs/technical-decisions.md`

**Checkpoint**: Contract checklist exists for future simulator fields and old projects remain compatible. See `docs/simulation-persistence-contract.md`.

---

## Phase 6: User Story 4 - Profesionalizar documentacion de portfolio (Priority: P4)

**Goal**: Keep public docs aligned with actual product capability and limitations.

**Independent Test**: A reviewer can read README and docs without finding contradictions about implemented simulator dimensions.

### Implementation for User Story 4

- [x] T027 [P] [US4] Update stale limitation about bandwidth/request size in `docs/product-vision.md`
- [ ] T028 [P] [US4] Update high-level capability summary in `README.md` if needed
- [ ] T029 [US4] Update `docs/roadmap.md` to separate current, next, future and out-of-scope work
- [ ] T030 [US4] Confirm `docs/simulation-model.md` matches `shared/simulator-core.js`

**Checkpoint**: Documentation is portfolio-ready and does not overstate simulator precision.

---

## Phase 5A: Security and Architecture Review - Frontend/Backend/DB (Priority: P3)

**Goal**: Verify trust boundaries, persistence ownership, session security, API protections and publication readiness.

**Independent Test**: A reviewer can read `docs/security-architecture-review.md` and validate the controls against code references.

### Tests and Implementation

- [x] T026A [P] [US3] Audit frontend security sinks and client-side secret exposure
- [x] T026B [P] [US3] Audit backend auth, CSRF, CORS, rate limit, headers and error handling
- [x] T026C [P] [US3] Audit MySQL ownership and persistence flow
- [x] T026D [US3] Harden session signature comparison in `backend/src/services/auth.service.js`
- [x] T026E [US3] Harden session cookie clearing options in `backend/src/services/auth.service.js`
- [x] T026F [US3] Add session security unit tests in `tests/unitarios.test.ts`
- [x] T026G [US3] Document review results in `docs/security-architecture-review.md`

**Checkpoint**: Security/architecture review complete with no critical or high blockers.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Validate and clean up after any approved implementation phase.

- [x] T031 Run `npm test` in repository root
- [x] T032 Run `npm run build` in repository root
- [x] T033 Run `npm run lint` in repository root
- [ ] T034 [P] Review `git diff` and confirm no unrelated files changed
- [ ] T035 [P] Update the relevant Spec Kit artifact in `specs/001-roadmap-modernizacion/` with deviations found during implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **US1 Roadmap prioritization**: Should happen first because it controls future sequencing.
- **Repository readiness**: Done after US1 because the repo is intended for publication.
- **US2 Explainability/latency**: Can start after repository readiness and Foundation.
- **US3 Contracts/persistence**: Can start after Foundation; recommended before adding new persisted fields.
- **US4 Documentation**: Can run after US1 or after each completed implementation phase.
- **Polish**: Run after any approved implementation phase.

### Parallel Opportunities

- T002 and T003 can run in parallel.
- T006 and T007 can run in parallel.
- T013 and T014 can run in parallel.
- T020 and T021 can run in parallel.
- T027 and T028 can run in parallel.

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1 only: update roadmap categorization.
3. Stop and validate with the user before touching simulator behavior.

### Incremental Delivery

1. US1: Align roadmap.
2. US2: Implement continuous latency and explanations.
3. US3: Harden contracts before more persisted fields.
4. US4: Update docs after the product behavior is settled.

### Stop Conditions

- Stop before installing any new dependency.
- Stop before changing database schema if target environment migration status is unknown.
- Stop before breaking an endpoint, DTO shape or saved-project compatibility.
