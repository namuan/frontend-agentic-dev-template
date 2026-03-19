# Codebase Structure

**Analysis Date:** 2026-03-19

## Directory Layout

```
project-root/
├── .eslintrc.cjs               # ESLint config with arch enforcement rules
├── .gitignore
├── AGENTS.md                   # Agent working guide
├── ARCHITECTURE.md             # Domain layout & dependency rules
├── index.html                  # Vite HTML entry
├── jest.config.cjs             # Jest config
├── package.json                # Scripts & dependencies
├── package-scripts-and-ci.js   # CI-related scripts
├── playwright.config.ts        # Playwright E2E config
├── tsconfig.json               # TypeScript config (path alias: @/ → src/)
├── tsconfig.node.json          # Node-specific TS config
├── vite.config.ts              # Vite config (alias: @/ → src/)
├── docs/                       # Project documentation
│   ├── design-docs/
│   └── exec-plans/
│       ├── active/
│       └── completed/
├── public/                     # Static assets (MSW worker copied here)
├── scripts/                    # Shell scripts (review, check-sizes, etc.)
│   └── prompts/
├── src/                        # Application source
│   ├── main.tsx                # App bootstrap entry
│   ├── vite-env.d.ts           # Vite type declarations
│   ├── app/                    # App shell
│   │   ├── App.tsx
│   │   ├── AppLayout.tsx
│   │   ├── AppLayout.module.css
│   │   ├── providers.tsx
│   │   └── router.tsx
│   ├── features/               # Feature domains (vertical slices)
│   │   ├── auth/
│   │   │   ├── api.ts
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── components/
│   │   │   │   ├── AuthPage.tsx
│   │   │   │   └── AuthPage.module.css
│   │   │   └── hooks/
│   │   │       ├── useAuth.ts
│   │   │       └── useAuth.test.tsx
│   │   ├── dashboard/
│   │   │   ├── api.ts
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── components/
│   │   │   │   ├── DashboardPage.tsx
│   │   │   │   └── DashboardPage.module.css
│   │   │   └── hooks/
│   │   │       ├── useDashboardData.ts
│   │   │       └── useDashboardData.test.tsx
│   │   └── settings/
│   │       ├── api.ts
│   │       ├── index.ts
│   │       ├── types.ts
│   │       ├── components/
│   │       │   ├── SettingsPage.tsx
│   │       │   └── SettingsPage.module.css
│   │       └── hooks/
│   │           ├── useSettings.ts
│   │           └── useSettings.test.tsx
│   ├── lib/                    # Shared infrastructure layer
│   │   ├── api/
│   │   │   ├── client.ts       # Fetch wrapper with Zod validation
│   │   │   └── errors.ts       # ApiError, ParseError classes
│   │   ├── components/         # Domain-agnostic UI primitives
│   │   │   ├── Button.tsx      + Button.module.css
│   │   │   ├── EmptyState.tsx  + EmptyState.module.css
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx       + Modal.module.css
│   │   │   ├── Select.tsx
│   │   │   ├── Spinner.tsx     + Spinner.module.css
│   │   │   ├── Textarea.tsx
│   │   │   └── Toast.tsx       + Toast.module.css
│   │   ├── hooks/
│   │   │   ├── useToast.tsx    (context provider + hook)
│   │   │   └── useToast.test.tsx
│   │   ├── styles/
│   │   │   ├── tokens.css      # CSS custom properties (design tokens)
│   │   │   └── global.css      # Reset + base styles
│   │   ├── types/              # Zod schemas (source of truth for data shapes)
│   │   │   ├── dashboardSchema.ts
│   │   │   ├── sessionSchema.ts
│   │   │   ├── settingsSchema.ts
│   │   │   └── userSchema.ts
│   │   └── utils/
│   │       ├── logger.ts       # logger.info/warn/error
│   │       └── storage.ts      # Zod-validated localStorage wrapper
│   └── mocks/                  # MSW mock server
│       ├── browser.ts          # setupWorker
│       ├── data.ts             # In-memory mock state
│       └── handlers.ts         # Route handlers with delays
└── tests/                      # Test infrastructure
    ├── customResolver.cjs      # Jest module resolver
    ├── setupGlobals.js         # Global test setup
    ├── setupTests.ts           # Testing Library / MSW setup
    ├── styleMock.js            # CSS module mock
    ├── e2e/
    │   └── ops-journey.spec.ts # Playwright E2E spec
    └── fixtures/
        ├── testUtils.tsx       # createWrapper() with test QueryClient
        ├── server.ts           # Test MSW server
        └── pages/              # Playwright page objects
            ├── AuthPage.ts
            └── DashboardPage.ts
```

## Directory Purposes

**`src/app/`:**
- Purpose: Application shell — bootstrapping, routing, providers, and layout
- Contains: Root component, router config, context providers, layout with sidebar navigation
- Key files: `App.tsx`, `router.tsx`, `providers.tsx`, `AppLayout.tsx`

**`src/features/{domain}/`:**
- Purpose: Self-contained vertical slices per business domain
- Contains: Page components, custom hooks (React Query), API functions, type re-exports, barrel index
- Key files: `api.ts`, `hooks/use*.ts`, `components/*Page.tsx`, `types.ts`, `index.ts`

**`src/lib/api/`:**
- Purpose: Centralized HTTP client with schema validation
- Contains: Generic `apiClient.get/post` wrapper, typed error classes
- Key files: `client.ts`, `errors.ts`

**`src/lib/components/`:**
- Purpose: Domain-agnostic, reusable UI primitives
- Contains: Button, EmptyState, ErrorBoundary, Input, Modal, Select, Spinner, Textarea, Toast
- Key files: Each component is a single `.tsx` file with a co-located `.module.css`

**`src/lib/hooks/`:**
- Purpose: Shared hooks usable across all feature domains
- Contains: `useToast` (context + hook for toast notifications)
- Key files: `useToast.tsx`

**`src/lib/types/`:**
- Purpose: Zod schemas — single source of truth for all external data shapes
- Contains: Schemas for dashboard, session, settings, user data
- Key files: `*Schema.ts` — each exports a Zod schema + inferred TypeScript types

**`src/lib/utils/`:**
- Purpose: Pure utility functions with no domain logic
- Contains: `logger.ts` (structured logging), `storage.ts` (Zod-validated localStorage)
- Key files: `logger.ts`, `storage.ts`

**`src/lib/styles/`:**
- Purpose: Global styles and design tokens
- Contains: CSS custom properties (`tokens.css`), global reset (`global.css`)
- Key files: `tokens.css`, `global.css`

**`src/mocks/`:**
- Purpose: MSW-based API mocking for development (no backend needed)
- Contains: HTTP handlers with artificial delays, in-memory state management
- Key files: `handlers.ts`, `data.ts`, `browser.ts`

**`tests/e2e/`:**
- Purpose: Playwright end-to-end tests organized by user journey
- Contains: Specs that drive the full app via browser automation
- Key files: `ops-journey.spec.ts`

**`tests/fixtures/`:**
- Purpose: Shared test infrastructure — page objects, mock server, test wrappers
- Contains: Playwright page objects in `pages/`, unit test utilities in `testUtils.tsx`
- Key files: `testUtils.tsx`, `pages/*.ts`, `server.ts`

## Key File Locations

**Entry Points:**
- `src/main.tsx`: Application bootstrap — starts MSW in dev, renders `<App />` into `#root`
- `src/app/App.tsx`: Root component composing providers + router
- `src/app/router.tsx`: Route definitions — lazy-loads feature pages via `React.lazy`

**Configuration:**
- `vite.config.ts`: Vite build config, `@/` path alias to `src/`
- `tsconfig.json`: TypeScript config, strict mode, `@/*` → `src/*` path mapping
- `.eslintrc.cjs`: Linting rules including `import/no-restricted-paths` enforcing architecture
- `jest.config.cjs`: Jest config for unit tests
- `playwright.config.ts`: Playwright config for E2E tests

**Core Logic:**
- `src/lib/api/client.ts`: Centralized fetch + Zod validation — all API calls flow through here
- `src/lib/types/*Schema.ts`: Zod schemas defining all external data contracts
- `src/app/providers.tsx`: QueryClient config (retry logic, stale time) + global providers

**Testing:**
- `tests/fixtures/testUtils.tsx`: `createWrapper()` for unit tests (test QueryClient + ToastProvider)
- `tests/fixtures/pages/`: Playwright page objects for E2E tests
- Unit tests: Co-located with source as `*.test.ts(x)` files

## Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `DashboardPage.tsx`, `Button.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`, `useDashboardData.ts`)
- API functions: `camelCase.ts` (e.g., `api.ts`)
- Types/schemas: `camelCaseSchema.ts` (e.g., `dashboardSchema.ts`, `sessionSchema.ts`)
- Tests: Co-located as `*.test.ts` or `*.test.tsx`
- CSS Modules: `PascalCase.module.css` co-located with component

**Directories:**
- Feature domains: `camelCase` (e.g., `auth`, `dashboard`, `settings`)
- Sub-folders: `camelCase` (e.g., `components`, `hooks`, `api`)

**Exports:**
- Each feature domain has an `index.ts` barrel file exporting public API (page component, hook, types)
- Components use named exports (e.g., `export function Button(...)`) except page components which use `export default`

**Path Aliases:**
- `@/` maps to `src/` via both `tsconfig.json` and `vite.config.ts`
- All internal imports use `@/` prefix (e.g., `import { apiClient } from '@/lib/api/client'`)

## Where to Add New Code

**New Feature Domain:**
- Create `src/features/{domain}/` with: `api.ts`, `types.ts`, `index.ts`, `components/`, `hooks/`
- Register routes in `src/app/router.tsx` with `React.lazy` import
- Add ESLint import restriction zone in `.eslintrc.cjs` for the new domain

**New Component:**
- Domain-specific: `src/features/{domain}/components/` with co-located `.module.css`
- Shared/reusable: `src/lib/components/` with co-located `.module.css`

**New Hook:**
- Domain-specific: `src/features/{domain}/hooks/use*.ts`
- Shared: `src/lib/hooks/use*.ts`

**New API Endpoint:**
- Zod schema in `src/lib/types/{domain}Schema.ts`
- API function in `src/features/{domain}/api.ts` using `apiClient.get/post` with schema
- React Query hook in `src/features/{domain}/hooks/use*.ts`

**New Zod Schema:**
- Add to `src/lib/types/{domain}Schema.ts`
- Export inferred types alongside schema

**New E2E Test:**
- Page object in `tests/fixtures/pages/{Page}.ts`
- Spec in `tests/e2e/{journey}.spec.ts`

**New Utility:**
- Pure functions → `src/lib/utils/`

## Special Directories

**`src/mocks/`:**
- Purpose: MSW mock server for development
- Generated: No
- Committed: Yes — provides realistic API responses without backend

**`public/`:**
- Purpose: Static assets served by Vite
- Generated: MSW worker script copied here by `msw init`
- Committed: Yes

**`.planning/`:**
- Purpose: GSD planning artifacts
- Generated: Yes
- Committed: No (in `.gitignore` or gitignored by convention)

**`tests/fixtures/pages/`:**
- Purpose: Playwright page object models for E2E tests
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-03-19*
