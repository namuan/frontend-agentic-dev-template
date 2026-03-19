# Architecture

**Analysis Date:** 2026-03-19

## Pattern Overview

**Overall:** Feature-based vertical slice architecture with shared lib layer

**Key Characteristics:**
- Each feature domain owns its components, hooks, API functions, and types in a self-contained folder
- Shared/infrastructure concerns isolated in `src/lib/` — components, hooks, API client, types (Zod schemas), and utils
- Dependency flow is strictly top-down: `features/` → `lib/`, never across feature boundaries
- Server state managed exclusively via React Query; no Redux or Zustand

## Layers

**App Shell (`src/app/`):**
- Purpose: Application bootstrap, routing, providers, and layout
- Location: `src/app/`
- Contains: `App.tsx` (root), `router.tsx` (route definitions), `providers.tsx` (context providers), `AppLayout.tsx` (sidebar + outlet shell)
- Depends on: `src/lib/`
- Used by: `src/main.tsx`

**Feature Domains (`src/features/{domain}/`):**
- Purpose: Self-contained vertical slices for each business domain (auth, dashboard, settings)
- Location: `src/features/auth/`, `src/features/dashboard/`, `src/features/settings/`
- Contains: `components/` (page-level components), `hooks/` (React Query hooks), `api.ts` (API calls), `types.ts` (re-exports from lib), `index.ts` (barrel exports)
- Depends on: `src/lib/` only
- Used by: `src/app/router.tsx` (via `React.lazy`)

**Shared Library (`src/lib/`):**
- Purpose: Cross-cutting infrastructure — reusable UI, data fetching, types, utilities
- Location: `src/lib/`
- Contains:
  - `api/` — `client.ts` (fetch wrapper with Zod parsing), `errors.ts` (ApiError, ParseError classes)
  - `components/` — Domain-agnostic UI primitives (Button, Modal, EmptyState, Spinner, Input, Select, Textarea, Toast, ErrorBoundary)
  - `hooks/` — Shared hooks (`useToast` context)
  - `types/` — Zod schemas and inferred types (`dashboardSchema`, `sessionSchema`, `settingsSchema`, `userSchema`)
  - `utils/` — `logger.ts`, `storage.ts` (Zod-validated localStorage)
  - `styles/` — `tokens.css` (design tokens), `global.css` (reset + base styles)
- Depends on: Nothing within `src/` (leaf layer)
- Used by: All feature domains and `src/app/`

**Mock Server (`src/mocks/`):**
- Purpose: MSW-based API mocking for development
- Location: `src/mocks/`
- Contains: `handlers.ts` (route definitions), `data.ts` (in-memory state), `browser.ts` (worker setup)
- Started conditionally in `src/main.tsx` when `import.meta.env.DEV`

**Test Infrastructure (`tests/`):**
- Purpose: E2E tests (Playwright) and shared test utilities
- Location: `tests/`
- Contains: `e2e/` (Playwright specs), `fixtures/` (page objects and test wrappers)

## Data Flow

**API Request Flow:**

1. **Feature hook** (e.g., `useDashboardData`) calls a feature-level API function (e.g., `fetchDashboard`)
2. **Feature API function** (`src/features/{domain}/api.ts`) calls `apiClient.get/post` from `src/lib/api/client.ts`, passing a Zod schema from `src/lib/types/`
3. **API client** (`src/lib/api/client.ts`) makes a `fetch()` call, checks `response.ok`, and parses the JSON through `schema.parse()`
4. **Parse error** → thrown as `ParseError`; **HTTP error** → thrown as `ApiError`
5. Validated data is returned to the React Query hook and cached

**Component Render Flow:**

1. **Router** (`src/app/router.tsx`) resolves route → lazy-loads feature page component wrapped in `ErrorBoundary` + `Suspense`
2. **Feature page component** (e.g., `DashboardPage.tsx`) calls domain hook for data
3. **Hook** returns `{ data, isLoading, error, ...actions }` — component handles loading/error/success states
4. Component renders using `src/lib/components/` primitives and CSS Modules for styling

**State Management:**

- **Server state:** React Query (`@tanstack/react-query`) — queries keyed by `['session']`, `['dashboard']`, `['settings']`
- **Local UI state:** `useState` / `useReducer` within components
- **Global app state:** React Context (`ToastProvider` in `src/app/providers.tsx`)
- **Auth state:** Query `['session']` managed by `useAuth` hook with `setQueryData` on login/logout mutations

## Key Abstractions

**API Client (`src/lib/api/client.ts`):**
- Purpose: Centralized fetch wrapper that enforces Zod schema validation at every API boundary
- Pattern: `apiClient.get<T>(path, schema)` / `apiClient.post<T, B>(path, body, schema)` — generic, schema-first

**Zod Schemas (`src/lib/types/`):**
- Purpose: Single source of truth for data shapes; types inferred via `z.infer<>`
- Pattern: Schema defined in `src/lib/types/{domain}Schema.ts`, imported by `src/lib/api/` and feature `types.ts`

**Feature Hooks (`src/features/{domain}/hooks/use*.ts`):**
- Purpose: Encapsulate all data fetching + mutations for a domain behind a clean hook interface
- Pattern: Return typed object `{ data, isLoading, error, ...mutations }` — components never call `useQuery` directly

**Error Boundary (`src/lib/components/ErrorBoundary.tsx`):**
- Purpose: Catch render errors and show fallback UI
- Pattern: Class component wrapping route-level `React.lazy` loads in `router.tsx` via `withBoundary()` helper

**MSW Mock Handlers (`src/mocks/handlers.ts`):**
- Purpose: Provide realistic API responses during development without a backend
- Pattern: `http.get/post` handlers with artificial delays; in-memory state in `data.ts`

## Entry Points

**Application Bootstrap:**
- Location: `src/main.tsx`
- Triggers: Browser loads `index.html` → Vite serves `main.tsx`
- Responsibilities: Starts MSW worker in dev mode, renders `<App />` into `#root`

**Router:**
- Location: `src/app/router.tsx`
- Triggers: URL navigation
- Responsibilities: Defines routes, lazy-loads feature pages, wraps in ErrorBoundary + Suspense

**App Shell:**
- Location: `src/app/App.tsx`
- Triggers: Rendered by `main.tsx`
- Responsibilities: Composes `AppProviders` around `RouterProvider`

## Error Handling

**Strategy:** Zod validation at data boundaries + typed error classes + ErrorBoundary for renders

**Patterns:**
- API responses: Parsed with Zod in `src/lib/api/client.ts` → `ParseError` on shape mismatch, `ApiError` on HTTP failure
- Feature hooks: Set `throwOnError: false` on queries; surface `error` field to components
- Components: Conditional rendering for loading/error/success states; `EmptyState` component for error UI
- Render errors: `ErrorBoundary` class component catches and renders fallback with reload action
- Storage: `src/lib/utils/storage.ts` wraps localStorage with Zod validation + graceful fallback on parse failure

## Cross-Cutting Concerns

**Logging:** Custom `logger` utility in `src/lib/utils/logger.ts` — `info` dev-only, `warn`/`error` always. No third-party logging.

**Validation:** Zod schemas at every external boundary — API responses, localStorage, form payloads.

**Styling:** CSS Modules (`.module.css` co-located with components) + global design tokens (`src/lib/styles/tokens.css`). No runtime CSS-in-JS.

**Testing utilities:** `tests/fixtures/testUtils.tsx` provides `createWrapper()` with a test-scoped QueryClient and ToastProvider for unit tests.

---

*Architecture analysis: 2026-03-19*
