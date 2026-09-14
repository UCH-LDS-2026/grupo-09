# Future Change Contracts

## Simulation Engine Contract

Any future simulation formula change MUST update:

- `shared/simulator-core.js`
- `shared/simulator-core.d.ts`
- `src/lib/simulator.ts` if it re-exports or adapts the shared contract
- `tests/unitarios.test.ts`
- `tests/integracion.test.ts` when behavior crosses the full `simulate()` flow
- `docs/simulation-model.md`

Acceptance rule:

- For the same normalized graph and request profile, frontend local simulation and backend
  simulation endpoint must produce equivalent totals and per-node metrics.

## Persistence Compatibility Contract

Any future field persisted with projects MUST define:

- frontend state field name;
- frontend DTO field name;
- backend DTO field name;
- database column or explicit non-persistence reason;
- default for old saved projects;
- validation range and maximum;
- migration path when schema changes.

Acceptance rule:

- Loading a project saved before the field existed must not throw and must apply the documented
  default.

## Documentation Contract

Any future feature that changes simulator behavior MUST update:

- `docs/simulation-model.md` with formulas and plain-language explanation;
- `docs/product-vision.md` if product capability or limitation changes;
- `docs/roadmap.md` if the feature moves from future/planned to current;
- `README.md` when setup, stack or high-level capability changes.

Acceptance rule:

- Documentation must not describe implemented behavior as missing or future-only.

## Validation Contract

Before and after each implementation phase, run:

```bash
npm test
npm run build
npm run lint
```

Acceptance rule:

- Any pre-existing failure must be reported separately from failures caused by the phase.

## Repository Publication Contract

Before pushing to a public or shared repository, verify:

- `.env`, `.env.local`, backend `.env`, logs, builds and dependency folders are ignored.
- `.env.example` files contain placeholders only.
- Agent/tooling folders do not commit credentials or local private state.
- `npm run security:audit` passes or every finding has an explicit remediation plan.
- Documentation does not advertise production-grade precision or real load testing.

Acceptance rule:

- `git status --short` and `.gitignore` review must show no obvious secret-bearing files staged or untracked for commit.
