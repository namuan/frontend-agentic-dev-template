# Testing Patterns

**Analysis Date:** 2026-03-19

## Test Framework

**Runner:**
- Jest 29.7.0 with jsdom environment
- Config: `jest.config.cjs`
- Transform: `ts-jest` for `.ts`/`.tsx`, `@swc/jest` for `.js`

**Assertion Library:**
- `@testing-library/jest-dom` 6.4.2 — DOM matchers (`.toBeVisible()`, `.toBeInTheDocument()`)
- `@testing-library/react` 14.2.2 — `renderHook`, `render`, `waitFor`
- `@testing-library/user-event` 14.5.2 — user interaction simulation

**Run Commands:**
```bash
npm test                    # Run all unit tests (jest --passWithNoTests)
npm run test:coverage       # Run with coverage report (jest --coverage)
npm run e2e                 # Run Playwright E2E tests
npm run e2e:headed          # Run Playwright with visible browser
npm run check               # Full check: lint + typecheck + test
```

## Test File Organization

**Location:**
- Unit tests co-located with source files using `.test.tsx`/`.test.ts` suffix
- E2E tests in `tests/e2e/` directory
- Test utilities and fixtures in `tests/fixtures/`

**Naming:**
- `src/features/auth/hooks/useAuth.ts` → `src/features/auth/hooks/useAuth.test.tsx`
- `src/lib/hooks/useToast.tsx` → `src/lib/hooks/useToast.test.tsx`
- `tests/e2e/ops-journey.spec.ts` — E2E uses `.spec.ts`

**Structure:**
```
src/
  features/
    auth/
      hooks/
        useAuth.ts
        useAuth.test.tsx      ← co-located unit test
    dashboard/
      hooks/
        useDashboardData.ts
        useDashboardData.test.tsx
  lib/
    hooks/
      useToast.tsx
      useToast.test.tsx
tests/
  setupGlobals.js             ← polyfills (TextEncoder, fetch, BroadcastChannel)
  setupTests.ts               ← MSW server setup (beforeAll/afterEach/afterAll)
  styleMock.js                ← CSS import stub
  fixtures/
    server.ts                 ← MSW node server instance
    testUtils.tsx             ← createWrapper() helper for hooks
    pages/
      AuthPage.ts             ← Playwright page object
      DashboardPage.ts        ← Playwright page object
  e2e/
    ops-journey.spec.ts       ← E2E test
```

## Test Structure

**Suite Organization:**
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper } from '../../../../tests/fixtures/testUtils';
import { useAuth } from './useAuth';
import * as authApi from '../api';

// Module-level mock — jest.mock must be at top level
jest.mock('../api', () => ({
  fetchSession: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
}));

const mockedFetchSession = authApi.fetchSession as jest.MockedFunction<typeof authApi.fetchSession>;

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFetchSession.mockResolvedValue(null);
  });

  it('starts in a loading state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('returns a session when available', async () => {
    const session = createSession();
    mockedFetchSession.mockResolvedValue(session);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.session?.user.name).toBe('Avery Quinn');
    });
  });

  it('surfaces an error when the session request fails', async () => {
    mockedFetchSession.mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});
```

**Patterns:**
- `beforeEach`: `jest.clearAllMocks()` + reset mock defaults
- Hooks tested via `renderHook()` with `createWrapper()` providing QueryClient + ToastProvider
- `waitFor()` for async state assertions
- Each hook tests three states minimum: loading, success, error

## Mocking

**Framework:** MSW (Mock Service Worker) v2 + Jest module mocks

**Two-layer approach:**

1. **MSW for integration/E2E** — `tests/fixtures/server.ts` sets up `setupServer(...handlers)` from `src/mocks/handlers.ts`. Handlers in `src/mocks/handlers.ts` define HTTP interceptors with realistic delays (150-300ms). Setup in `tests/setupTests.ts`:
   ```typescript
   beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
   afterEach(() => server.resetHandlers());
   afterAll(() => server.close());
   ```

2. **Jest module mocks for unit tests** — Hook tests mock the API module directly:
   ```typescript
   jest.mock('../api', () => ({
     fetchSession: jest.fn(),
   }));
   const mockedFetchSession = authApi.fetchSession as jest.MockedFunction<typeof authApi.fetchSession>;
   ```

**What to Mock:**
- API layer modules (`../api`) for hook unit tests
- Use `jest.fn()` with `mockResolvedValue()` / `mockRejectedValue()` for async functions
- Cast mocks with `jest.MockedFunction<typeof original>` for type safety

**What NOT to Mock:**
- Do NOT mock React Query internals — provide a real `QueryClient` via `createWrapper()`
- Do NOT mock components for hook tests — test hooks directly with `renderHook()`
- Do NOT use MSW in unit tests — MSW is for integration/E2E only

## Fixtures and Factories

**Test Data:**
```typescript
// src/mocks/data.ts — shared test fixtures
const user = {
  id: 'user-001',
  name: 'Avery Quinn',
  email: 'avery.quinn@northstar.ai',
  role: 'owner' as const,
};

export function createSession(): Session {
  return {
    user,
    token: 'demo-token-2026-aurora',
    expiresAt: '2026-04-17T08:00:00.000Z',
  };
}

export function resetSession(): void { session = null; }
export function setSession(next: Session): void { session = next; }
```

**Location:** `src/mocks/data.ts` — shared between MSW handlers and unit test setup

**Test Wrapper (critical for hook tests):**
```typescript
// tests/fixtures/testUtils.tsx
export function createWrapper(): React.FC<{ children: React.ReactNode }> {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    );
  };
}
```
- `createTestQueryClient()` disables retries and `throwOnError` for deterministic tests
- Wrapper includes both `QueryClientProvider` and `ToastProvider`

## Coverage

**Requirements:** No enforced coverage threshold detected

**View Coverage:**
```bash
npm run test:coverage
```

## Test Types

**Unit Tests (Jest):**
- Scope: Custom hooks, utility functions
- Approach: `renderHook()` + `waitFor()` for hooks; direct invocation for utilities
- Files: `src/**/*.test.ts(x)`, excluded from E2E via `testPathIgnorePatterns: ['<rootDir>/tests/e2e/']`

**Integration Tests (Jest + MSW):**
- Not a separate category — MSW server runs in `setupTests.ts` but unit tests use direct module mocks instead
- MSW handlers available for future integration test patterns

**E2E Tests (Playwright):**
- Framework: `@playwright/test` 1.44.0
- Config: `playwright.config.ts`
- Test directory: `tests/e2e/`
- Base URL: `http://localhost:5173`
- Approach: Page Object Model — page classes in `tests/fixtures/pages/`
- Selectors: `data-testid` exclusively, configured via `testIdAttribute: 'data-testid'`
- Timeout: 30 seconds per test
- Trace: captured on first retry for debugging

**Page Object Pattern:**
```typescript
// tests/fixtures/pages/AuthPage.ts
export class AuthPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/auth');
  }

  async signIn(email: string, accessCode: string): Promise<void> {
    await this.page.getByTestId('auth-email').fill(email);
    await this.page.getByTestId('auth-code').fill(accessCode);
    await this.page.getByTestId('sign-in').click();
  }

  async expectSignedIn(): Promise<void> {
    await expect(this.page.getByTestId('auth-session')).toBeVisible();
  }
}
```

## Common Patterns

**Async Testing:**
```typescript
// Use waitFor() for React Query state transitions
await waitFor(() => {
  expect(result.current.data).toBeDefined();
});

// Mock async resolution
mockedFetchSession.mockResolvedValue(session);
// Mock async rejection
mockedFetchSession.mockRejectedValue(new Error('Server error'));
```

**Error Testing:**
```typescript
it('surfaces an error when the request fails', async () => {
  mockedFetchSession.mockRejectedValue(new Error('Server error'));
  const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
  await waitFor(() => {
    expect(result.current.error).toBeTruthy();
  });
});
```

**Context Provider Testing:**
```typescript
it('throws when used outside the provider', () => {
  expect(() => {
    renderHook(() => useToast());
  }).toThrow('useToast must be used within ToastProvider');
});
```

**Forbidden Patterns:**
- Snapshot tests — forbidden per `docs/FRONTEND.md` ("brittle and uninformative")
- Selecting by CSS class or text content in E2E — use `data-testid` only
- Shared state between E2E tests — all tests must be idempotent

---

*Testing analysis: 2026-03-19*
