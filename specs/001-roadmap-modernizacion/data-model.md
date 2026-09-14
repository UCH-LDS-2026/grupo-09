# Data Model: Roadmap de Modernizacion Stressflow

## RoadmapPhase

Represents one future improvement phase.

Fields:

- `id`: stable identifier such as `latencia-progresiva`
- `priority`: P1, P2, P3, P4
- `goal`: user-visible outcome
- `scope`: included work
- `outOfScope`: work explicitly excluded
- `acceptanceCriteria`: measurable validation points
- `riskLevel`: low, medium, high
- `requiredValidation`: commands and manual checks

## SimulationMetric

Represents a simulator result that should be explainable in UI/docs.

Fields:

- `name`: metric label such as latency, throughput, incomingMBps, saturationReason
- `source`: where it is calculated, usually `shared/simulator-core.js`
- `inputs`: user-controlled or derived inputs
- `formula`: human-readable formula or rule
- `displayLocations`: UI components that show it
- `testCoverage`: test files that protect it

## CompatibilityDefault

Represents a default value used when older saved projects lack a newer field.

Fields:

- `field`: new field name
- `defaultValue`: fallback value
- `normalizationLayer`: shared, frontend, backend or database
- `migrationRequired`: boolean
- `oldProjectBehavior`: expected behavior when field is absent

## ValidationBaseline

Represents the state before implementation work.

Fields:

- `date`: validation date
- `command`: command executed
- `result`: pass/fail
- `summary`: key output
- `notes`: warnings or caveats

Current baseline:

| Command | Result | Summary |
|---------|--------|---------|
| `npm test` | pass | 2 files, 25 tests |
| `npm run build` | pass | Vite client and SSR builds completed |
| `npm run lint` | pass | ESLint completed with no reported errors |
