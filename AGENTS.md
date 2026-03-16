# Agent guide

You are working in a React application. This file is a **map**, not a manual.
Read the sections relevant to your task; do not try to hold everything at once.

## Quick orientation

| What you need | Where to look |
|---|---|
| App architecture & domain layout | `ARCHITECTURE.md` |
| Design system, component patterns | `docs/DESIGN.md` |
| Frontend coding standards | `docs/FRONTEND.md` |
| Product behaviour & acceptance criteria | `docs/product-specs/` |
| Active work & decisions in flight | `docs/exec-plans/active/` |
| Known tech debt | `docs/exec-plans/tech-debt-tracker.md` |
| Quality grades per domain | `docs/QUALITY_SCORE.md` |
| Reliability & error handling rules | `docs/RELIABILITY.md` |
| Security invariants | `docs/SECURITY.md` |
| External library references (LLM-friendly) | `docs/references/` |

## How to work in this repo

### Starting a task
1. Read `ARCHITECTURE.md` to understand which domain your task touches.
2. Read the relevant spec in `docs/product-specs/` if one exists.
3. For non-trivial changes, create a lightweight plan in `docs/exec-plans/active/`
   before writing code. Use the template in that directory.

### Writing code
- Every component lives in its domain folder under `src/`. See `ARCHITECTURE.md`.
- Parse/validate external data at the boundary. See `docs/RELIABILITY.md`.
- Never reach across domain boundaries directly. Use the shared `src/lib/` layer.
- Follow component and hook patterns in `docs/FRONTEND.md`.

### Testing
- Unit tests (Jest): co-located with the file they test, `*.test.ts(x)`.
- Integration / E2E tests (Playwright): `tests/e2e/` organised by user journey.
- Every PR must leave the test suite green. Run `npm test` and `npm run e2e` before
  opening a PR.
- When fixing a bug, add a regression test first.

### Pull requests
1. Run `npm run lint`, `npm run typecheck`, `npm test` locally. Fix all failures.
2. Self-review your diff: check for console.logs, commented-out code, and
   TODO comments left in production paths.
3. Write a PR description covering: what changed, why, and how to verify it.
4. Request the `agent-reviewer` check (see `scripts/agent-review.sh`).
5. Address all reviewer comments before merging.

### When you're stuck
If a task is ambiguous, look for a product spec or exec plan first.
If none exists, surface the ambiguity in the PR description rather than guessing.
Do not escalate to a human for purely mechanical decisions — consult the docs.

## What is off-limits
- Do not write to `docs/generated/` manually — those files are machine-produced.
- Do not delete or rename files in `docs/references/` — update them in place.
- Do not bypass linting or typecheck failures with `// eslint-disable` or
  `@ts-ignore` unless the relevant doc explicitly permits it.
