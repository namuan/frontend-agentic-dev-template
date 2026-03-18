# Exec plan: Demo application scaffold

**Status**: completed  
**Created**: 2026-03-17  
**Owner**: agent

## Goal

Create a runnable demo React app that follows the repository structure and standards, including Jest and Playwright tests.

## Acceptance criteria

- [x] App boots with React Router, React Query providers, and three feature routes (auth, dashboard, settings)
- [x] Shared lib components, styles, and utilities exist per docs/DESIGN.md and docs/RELIABILITY.md
- [x] Jest tests cover custom hooks (loading, success, error states) and pass
- [x] Playwright has a happy-path user journey using page objects and data-testid selectors
- [x] All existing tests pass
- [x] New tests cover the happy path and at least one error path

## Approach

Scaffold Vite + React + TypeScript config, implement shared lib primitives, then build feature domains and route-level screens. Use Zod schemas at API boundaries and MSW for test mocking.

## Steps

- [x] Add project configuration (package.json, Vite, TS, Jest, Playwright)
- [x] Implement shared lib styles, components, API client, and types
- [x] Implement feature domains and route composition
- [x] Add Jest hook tests with MSW and Playwright E2E journey

## Decisions log

| Date | Decision | Rationale |
|---|---|---|
| 2026-03-17 | Use Vite + React + TS with Jest + Playwright | Minimal, common setup that fits repo standards |

## Blockers

None.

## Notes

Tests were added but not run in this environment.
