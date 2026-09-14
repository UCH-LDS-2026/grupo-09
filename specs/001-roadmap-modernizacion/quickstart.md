# Quickstart: Validating the Planning Artifacts

## 1. Confirm no functional files changed

```bash
git status --short
```

Expected result for this planning task:

- New Spec Kit infrastructure: `.agents/`, `.specify/`, `AGENTS.md`
- New planning artifacts: `specs/001-roadmap-modernizacion/`
- No modifications under `src/`, `backend/`, `shared/`, `database/` or `tests/`

## 2. Re-run baseline commands

```bash
npm test
npm run build
npm run lint
npm run security:audit
```

Expected result:

- Tests pass
- Build passes
- Lint passes
- Frontend/backend production audits report 0 vulnerabilities, or findings are documented

## 3. Review current-state findings

Check these files:

- `shared/simulator-core.js`
- `tests/unitarios.test.ts`
- `docs/simulation-model.md`
- `docs/product-vision.md`

Expected result:

- Request size and bandwidth are present in code/tests/docs.
- Product vision still needs a future documentation alignment pass.

## 4. Choose next implementation phase

Recommended next phase:

1. Latencia progresiva
2. Explicabilidad de resultados
3. Contratos/persistencia
4. Documentacion de portfolio

Implementation should start only after approving one phase from `tasks.md`.

## 5. Publication readiness check

Before publishing, verify:

```bash
git status --short
```

Expected result:

- No `.env` files appear.
- No generated `dist/`, `node_modules/`, logs or local caches appear.
- `.agents/skills/` can appear because it contains Spec Kit skills; other `.agents` state should stay ignored.
