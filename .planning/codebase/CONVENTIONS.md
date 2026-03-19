# Coding Conventions

**Analysis Date:** 2026-03-19

## Naming Patterns

**Files:**
- Components: PascalCase `.tsx` — `AuthPage.tsx`, `DashboardPage.tsx`, `Button.tsx`
- Hooks: camelCase with `use` prefix `.ts`/`.tsx` — `useAuth.ts`, `useDashboardData.ts`, `useToast.tsx`
- Utilities: camelCase `.ts` — `logger.ts`, `storage.ts`
- Zod schemas: camelCase with `Schema` suffix `.ts` — `userSchema.ts`, `sessionSchema.ts`, `loginSchema` (in `types.ts`)
- Tests: same name as source + `.test` suffix — `useAuth.test.tsx`, `useDashboardData.test.tsx`
- CSS Modules: PascalCase matching component + `.module.css` — `Button.module.css`, `AuthPage.module.css`

**Functions:**
- Named exports for all functions, never default exports for utilities/hooks — `export function useAuth()`, `export function fetchSession()`
- Page components use `export default function PageName()` (exception: only for lazy-loaded route components)
- `async` functions explicitly typed with `Promise<T>` return — `export async function login(payload: LoginPayload): Promise<Session>`

**Variables:**
- camelCase for all variables and function parameters
- `const` preferred for non-reassigned values; destructuring is standard

**Types:**
- `interface` for component props (never `type`)
- `type` aliases derived from Zod schemas — `type Session = z.infer<typeof sessionSchema>`
- Named type exports from `types.ts` files within each feature domain

## Code Style

**Formatting:**
- ESLint with `@typescript-eslint/recommended` — config at `.eslintrc.cjs`
- No Prettier detected (formatting enforced by ESLint rules only)
- `strict: true` in `tsconfig.json` — all strict checks enabled

**Linting Rules (critical):**
- `no-console: ['error', { allow: ['warn', 'error'] }]` — no `console.log` in production code
- `@typescript-eslint/no-explicit-any: 'error'` — `any` is forbidden, use `unknown` and narrow
- `react/react-in-jsx-scope: 'off'` — React 18 JSX transform, no import needed
- `react/prop-types: 'off'` — TypeScript handles prop validation
- `import/no-restricted-paths` — enforces domain isolation (see Architecture rules below)

**Architecture Enforcement (ESLint zones):**
- `features/auth` cannot import from `features/dashboard` or `features/settings`
- `features/dashboard` cannot import from `features/auth` or `features/settings`
- `features/settings` cannot import from `features/auth` or `features/dashboard`
- `lib/components` cannot import from `lib/api` — data fetching belongs in feature domains
- Shared code goes to `src/lib/` first, then imported by domains

## Import Organization

**Order:**
1. React and React ecosystem imports (`import * as React from 'react'`)
2. Third-party packages (`import { useQuery } from '@tanstack/react-query'`)
3. Absolute `@/` aliases (`import { apiClient } from '@/lib/api/client'`)
4. Relative imports (`import { loginSchema } from './types'`)

**Path Aliases:**
- `@/` maps to `src/` — configured in both `vite.config.ts` and `tsconfig.json` paths
- Jest uses `moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' }` to match
- Never use relative imports that go up more than one level (`../../` is a smell)
- Barrel files (`index.ts`) only at feature domain boundaries, not inside a domain's internal folders

**React Import Style:**
- `import * as React from 'react'` — namespace import pattern (not destructured)

## Error Handling

**API Layer:**
- Custom error classes in `src/lib/api/errors.ts`:
  - `ApiError(status, body)` — thrown when HTTP response is not OK
  - `ParseError(cause)` — thrown when Zod schema validation fails on response
- The `apiClient` (`src/lib/api/client.ts`) wraps `fetch()` and validates every response through `schema.parse()`

**Component Error Handling:**
- Every data-fetching component must handle three states: `loading`, `error`, `success`
- Loading: render `<Spinner />` with descriptive text
- Error: render `<EmptyState>` with retry action
- Success: render data
- Error boundaries wrap each route via `withBoundary()` in `src/app/router.tsx`

**Mutation Error Handling:**
- Mutations surface errors via hook return values (`loginError`, `saveError`)
- Components catch mutation errors locally and set form-level error state
- Pattern in `AuthPage.tsx`:
  ```tsx
  try {
    await login({ email, accessCode });
  } catch {
    setFormError('Access denied. Check your credentials and try again.');
  }
  ```

## Logging

**Framework:** Custom `logger` utility at `src/lib/utils/logger.ts`

**Patterns:**
- `logger.info()` — DEV only (guarded by `import.meta.env.DEV`), uses `console.warn` to surface in dev tools
- `logger.warn()` — always active, uses `console.warn`
- `logger.error()` — always active, uses `console.error`
- Call with `(message, context?)` — context is `Record<string, unknown>`
- Used in `ErrorBoundary.componentDidCatch()` for UI error tracking

## Comments

**When to Comment:**
- Minimal comments — code should be self-documenting
- Architecture rationale comments only when non-obvious (e.g., ESLint zone messages explain *why* imports are restricted)
- No JSDoc/TSDoc usage detected

**Forbidden:**
- No `TODO` or `FIXME` comments in production paths (PR self-review checklist requires removal)

## Function Design

**Size:** Functions are small and focused. Hooks encapsulate one concern (auth, dashboard data, settings). Components separate loading/error/success rendering into distinct blocks.

**Parameters:**
- Destructured object parameters for components (`{ variant, className, ...props }`)
- Single typed arguments for API functions (`payload: LoginPayload`)
- Return types explicitly annotated on all public functions

**Return Values:**
- Hooks return named objects with explicit type annotation:
  ```ts
  export function useAuth(): {
    session: Session | null;
    isLoading: boolean;
    // ...
  }
  ```
- API functions return typed promises — `Promise<Session>`, `Promise<void>`

## Module Design

**Exports:**
- Feature domains export from `index.ts` barrel files — `export { default as AuthPage }`, `export { useAuth }`, `export * from './types'`
- Internal implementation (hooks, api, types) stays private unless explicitly re-exported
- Shared lib exports are direct file imports via `@/lib/...` path alias

**CSS Modules:**
- `.module.css` files co-located with components
- Imported as `styles` object, accessed as `styles.className`
- Dynamic class composition via array + `.filter(Boolean).join(' ')`:
  ```tsx
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ');
  ```
- CSS custom properties from `src/lib/styles/tokens.css` — never raw hex/px values

**data-testid Convention:**
- Format: `{action-or-noun}-{context}` in kebab-case
- Set on every interactive element — `<button data-testid="sign-in">`, `<input data-testid="auth-email">`
- Playwright `testIdAttribute: 'data-testid'` in config
- Required for new user-facing features per DESIGN.md

---

*Convention analysis: 2026-03-19*
