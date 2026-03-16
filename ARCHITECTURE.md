# Architecture

## Domain layout

The application is divided into vertical **feature domains** under `src/features/`.
Each domain owns its own components, hooks, state, and tests.
Cross-cutting concerns live in `src/lib/`.

```
src/
  features/
    auth/             # Authentication & session
    dashboard/        # Main dashboard views
    settings/         # User & app settings
    # ... add domains here
  lib/
    api/              # Fetch wrapper, error handling, types
    components/       # Pure, domain-agnostic UI components
    hooks/            # Shared hooks (useAsync, useDebounce, etc.)
    utils/            # Pure utility functions
    types/            # Global TypeScript types & Zod schemas
  app/
    App.tsx
    router.tsx
    providers.tsx     # All context providers composed here
tests/
  e2e/               # Playwright tests, organised by user journey
  fixtures/          # Shared test data & mocks
```

## Dependency rules (strictly enforced by linter)

```
features/{domain}  →  lib/*          ✅ allowed
features/{domain}  →  features/*     ❌ forbidden (use lib/ as intermediary)
lib/components     →  lib/hooks      ✅ allowed
lib/components     →  lib/api        ❌ forbidden (data fetching belongs in features)
lib/api            →  lib/types      ✅ allowed
lib/api            →  lib/hooks      ❌ forbidden
```

The linter enforces these via `eslint-plugin-import` rules in `.eslintrc.cjs`.
Violations fail CI. Error messages include the rule name and a pointer to this file.

## State management

- Local UI state: `useState` / `useReducer` in the component.
- Shared async state: React Query (`@tanstack/react-query`). All server state lives here.
- Global app state (auth, theme, feature flags): React context in `src/app/providers.tsx`.
- No Redux. No Zustand unless a clear case is made in a design doc.

## Data boundaries

All data from external sources (API responses, URL params, localStorage) must be
parsed with a Zod schema at the point of entry. Never trust raw response shapes.
Define schemas in `src/lib/types/` and import them into `src/lib/api/`.

See `docs/RELIABILITY.md` for error handling patterns at boundaries.

## Routing

React Router v6. Route definitions live in `src/app/router.tsx`.
Lazy-load feature-level route components with `React.lazy`.

## Component philosophy

- Prefer small, composable components over large monoliths.
- A component file should not exceed 200 lines. Split if it does.
- Business logic belongs in hooks, not in JSX.
- See `docs/FRONTEND.md` for naming, file structure, and patterns.
