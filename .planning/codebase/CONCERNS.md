# Codebase Concerns

**Analysis Date:** 2026-03-19

## Tech Debt

**No real API backend — mock-only application:**
- Issue: The entire app runs on MSW mocks (`src/mocks/handlers.ts`, `src/mocks/data.ts`). There is no real backend integration. Module-level mutable state in `src/mocks/data.ts` (e.g., `let session`, `let settings`) simulates server state but does not persist across page reloads.
- Files: `src/mocks/handlers.ts`, `src/mocks/data.ts`, `src/mocks/browser.ts`
- Impact: When connecting a real backend, the MSW handlers must be replaced. The mock data shape may drift from the real API contract.
- Fix approach: Create a real API client configuration (base URL, env var) and swap MSW off via `import.meta.env` flag. Keep Zod schemas as the contract.

**API client sends no authorization headers:**
- Issue: `src/lib/api/client.ts` never attaches an `Authorization` header or any auth token to requests. The session token stored by `useAuth` is never forwarded to the server.
- Files: `src/lib/api/client.ts`
- Impact: All authenticated API calls will fail against a real backend. Every request is effectively anonymous.
- Fix approach: Add an auth token interceptor to the `request` function. Store token in a module-level variable set by the auth module, and inject `Authorization: Bearer <token>` into every request header.

**No CSRF token handling:**
- Issue: `docs/SECURITY.md` states "All state-mutating API requests must include a CSRF token in the `X-CSRF-Token` header." No code implements this.
- Files: `src/lib/api/client.ts`
- Impact: POST/PUT/DELETE requests are vulnerable to CSRF attacks once a real backend is connected.
- Fix approach: Retrieve CSRF token from a meta tag or cookie on startup, attach to mutating requests in `src/lib/api/client.ts`.

**Missing sanitization utility:**
- Issue: `docs/SECURITY.md` references `src/lib/utils/sanitize.ts` — this file does not exist.
- Files: `docs/SECURITY.md` (references nonexistent `src/lib/utils/sanitize.ts`)
- Impact: If user-generated HTML content is ever rendered, there is no XSS sanitization utility available.
- Fix approach: Create `src/lib/utils/sanitize.ts` with an `escape()` function, or adopt a library like `dompurify`.

**`error` type is `unknown` throughout hooks:**
- Issue: `useAuth`, `useDashboardData`, and `useSettings` all type their `error` and `loginError`/`saveError` properties as `unknown`. Consumers cannot distinguish between `ApiError`, `ParseError`, or `ZodError`.
- Files: `src/features/auth/hooks/useAuth.ts`, `src/features/dashboard/hooks/useDashboardData.ts`, `src/features/settings/hooks/useSettings.ts`
- Impact: Error handling in components is limited to generic messages. No way to show status-code-specific feedback.
- Fix approach: Use `error instanceof ApiError` checks in components, or type the return union as `ApiError | ParseError | null`.

**No session expiration or token refresh logic:**
- Issue: The session schema includes `expiresAt` (`src/lib/types/sessionSchema.ts`), but nothing checks it. No automatic token refresh exists. React Query's retry config in `src/app/providers.tsx` does not handle 401 responses specially.
- Files: `src/lib/types/sessionSchema.ts`, `src/app/providers.tsx`, `src/features/auth/hooks/useAuth.ts`
- Impact: Expired sessions will cause silent failures on API calls. Users won't be redirected to re-authenticate.
- Fix approach: Add a 401 interceptor that clears the session query cache and redirects to `/auth`. Optionally add a proactive expiration check.

**Logger.info uses `console.warn` instead of `console.info`:**
- Issue: In `src/lib/utils/logger.ts` line 12, `logger.info` calls `console.warn` instead of `console.info`.
- Files: `src/lib/utils/logger.ts`
- Impact: Info-level messages appear as warnings in the browser console, creating noise.
- Fix approach: Change `console.warn` to `console.info` on line 12.

## Known Bugs

**`throwOnError` inconsistency between hook and global config:**
- Issue: `src/app/providers.tsx` line 10 sets `throwOnError: true` globally for React Query. But `useAuth` (line 24), `useDashboardData` (line 14), and `useSettings` (line 22) each set `throwOnError: false` at the query level. The global setting is overridden everywhere, making the ErrorBoundary in `src/app/router.tsx` unreachable for query errors.
- Files: `src/app/providers.tsx`, `src/features/auth/hooks/useAuth.ts`, `src/features/dashboard/hooks/useDashboardData.ts`, `src/features/settings/hooks/useSettings.ts`
- Trigger: Any API error — the ErrorBoundary never catches it because errors are suppressed at the hook level.
- Workaround: Errors are handled inline in components via the `error` property. But the documented pattern (throw to ErrorBoundary) is broken.

**Settings form save button doesn't submit the form:**
- Issue: `src/features/settings/components/SettingsPage.tsx` line 114 has `<Button type="button" onClick={handleSave}>`. The button type is `"button"` not `"submit"`, and the `<form>` has no `onSubmit` handler. The form relies entirely on the click handler.
- Files: `src/features/settings/components/SettingsPage.tsx`
- Impact: Enter key does not trigger save. Form semantics (accessibility) are broken.
- Fix approach: Change to `type="submit"` and add `onSubmit={(e) => { e.preventDefault(); handleSave(); }}` to the form.

**Login error message doesn't distinguish auth failure from network error:**
- Issue: In `src/features/auth/components/AuthPage.tsx` line 103-106, the fallback message `'Access could not be verified. Try again.'` is shown for both `formError` and `loginError`. If the server returns a 401 vs a 500, the user sees the same message.
- Files: `src/features/auth/components/AuthPage.tsx`
- Impact: Users cannot tell if they entered wrong credentials vs. the server being down.
- Fix approach: Check `loginError instanceof ApiError` and show status-specific messages.

## Security Considerations

**No route protection / auth guards:**
- Issue: All routes (`/`, `/auth`, `/settings`) in `src/app/router.tsx` are publicly accessible. There is no guard that redirects unauthenticated users to `/auth`.
- Files: `src/app/router.tsx`
- Risk: An unauthenticated user can access the dashboard and settings pages. The UI may show empty/error states but the routes themselves are not protected.
- Current mitigation: None.
- Recommendations: Add a route guard component that checks `useAuth().session` and redirects to `/auth` if null.

**Hardcoded demo credentials in mock data:**
- Issue: `src/mocks/data.ts` contains hardcoded user data (`user-001`, email `avery.quinn@northstar.ai`) and a static token (`demo-token-2026-aurora`). The login in MSW handler (`src/mocks/handlers.ts` line 17) accepts any credentials — no validation.
- Files: `src/mocks/data.ts`, `src/mocks/handlers.ts`
- Risk: If MSW is accidentally enabled in production, any credentials will grant access.
- Current mitigation: MSW is gated behind `import.meta.env.DEV` in `src/main.tsx`.
- Recommendations: Ensure build process tree-shakes MSW in production. Add a build-time check.

**`storage.ts` unused — potential sensitive data leak vector:**
- Issue: `src/lib/utils/storage.ts` provides `localStorage` read/write utilities with Zod validation. While not currently used, it exists in `src/lib/` and could be used for storing session data, contradicting `docs/SECURITY.md` line 28 ("Access tokens are stored in memory only").
- Files: `src/lib/utils/storage.ts`, `docs/SECURITY.md`
- Risk: Future developers may use it to persist tokens or PII in localStorage.
- Recommendations: Add a prominent warning comment in `storage.ts` about not storing tokens. Or remove it until needed.

**No input sanitization on login form:**
- Issue: `src/features/auth/types.ts` validates email format and access code length with Zod, but no sanitization is applied before the data is sent. The mock handler in `src/mocks/handlers.ts` line 38 uses `as Partial<{...}>` type assertion instead of Zod validation.
- Files: `src/features/auth/types.ts`, `src/mocks/handlers.ts`
- Risk: With a real backend, the POST body is validated on the client but the mock handler skips server-side validation.
- Fix approach: Add Zod validation in the mock handler to simulate real API behavior. Ensure real backend validates independently.

## Performance Bottlenecks

**No code splitting beyond route-level lazy loading:**
- Issue: `src/app/router.tsx` uses `React.lazy()` for page-level code splitting. But all `src/lib/components/*` are bundled together. As the component library grows, the initial bundle will grow.
- Files: `src/app/router.tsx`
- Impact: Minimal now with 8 components, but will degrade as the lib layer grows.
- Improvement path: Consider lazy-loading heavy components like `Modal` which is only used conditionally.

**Toast ID generation uses `Math.random()`:**
- Issue: `src/lib/hooks/useToast.tsx` line 21 uses `Math.random().toString(36).slice(2, 10)` for toast IDs. This is not cryptographically secure and has a theoretical collision risk if many toasts fire simultaneously.
- Files: `src/lib/hooks/useToast.tsx`
- Impact: Extremely low probability of collision in practice. Not a real performance concern.
- Fix approach: Use `crypto.randomUUID()` if available, or accept the current approach as adequate for toast notifications.

## Fragile Areas

**Mock handler type assertion instead of validation:**
- Issue: `src/mocks/handlers.ts` line 38 uses `await request.json() as Partial<{ theme: string; notifications: boolean; weeklyDigest: boolean }>` — a raw `as` cast. This bypasses Zod validation entirely and could mask shape mismatches.
- Files: `src/mocks/handlers.ts`
- Why fragile: If the `Preferences` type changes in `src/lib/types/settingsSchema.ts`, the mock handler won't catch the drift. Production handlers would fail silently.
- Safe modification: Replace the `as` cast with `preferencesSchema.partial().parse(await request.json())`.
- Test coverage: No unit test for mock handlers. Only the E2E test (`tests/e2e/ops-journey.spec.ts`) exercises them indirectly.

**Mock module-level mutable state causes test pollution:**
- Issue: `src/mocks/data.ts` uses `let session` and `let settings` as module-level mutable variables. Tests that import from `@/mocks/data` and call `setSession()` or `updateSettings()` mutate shared state. The `useAuth.test.tsx` calls `resetSession()` in `beforeEach`, but this only works because the test imports the same module.
- Files: `src/mocks/data.ts`, `src/features/auth/hooks/useAuth.test.tsx`
- Why fragile: If tests run in parallel (e.g., via Jest's `--shard` or worker threads), shared mutable state will cause flaky tests.
- Safe modification: Factory functions that return fresh mock data per test, or use Jest's `jest.isolateModules()`.

**Single E2E test covering only sign-in flow:**
- Issue: `tests/e2e/ops-journey.spec.ts` has exactly one test: sign in → check dashboard. No E2E tests for settings, error states, logout, or edge cases.
- Files: `tests/e2e/ops-journey.spec.ts`
- Why fragile: Any UI change to settings or error states won't be caught by E2E. Regressions in logout flow are invisible.
- Safe modification: Add page objects for Settings (`tests/fixtures/pages/SettingsPage.ts` already exists) and write E2E tests for the full operator journey including settings changes and sign-out.

**Settings form has no dirty state tracking:**
- Issue: `src/features/settings/components/SettingsPage.tsx` keeps a local `preferences` state copied from the query data. The save button is always enabled — there is no comparison to detect unsaved changes. Clicking save with no changes still fires an API call.
- Files: `src/features/settings/components/SettingsPage.tsx`
- Why fragile: Unnecessary API calls on every save click. No warning if user navigates away with unsaved changes.
- Safe modification: Compare `preferences` to `data.preferences` to disable save when clean, and add a navigation guard for dirty state.

## Scaling Limits

**No error boundary at the provider level:**
- Issue: Error boundaries exist per-route (`src/app/router.tsx` line 11-18) but not at the `AppProviders` level (`src/app/providers.tsx`). If the `QueryClientProvider` or `ToastProvider` throws, the entire app crashes with no recovery UI.
- Files: `src/app/providers.tsx`
- Current capacity: Works for a small app with 3 routes. Will become a problem as provider complexity grows.
- Scaling path: Wrap `AppProviders` content in an `ErrorBoundary` component.

**No feature-to-feature communication pattern:**
- Issue: Features are isolated by ESLint rules (`.eslintrc.cjs` lines 33-53) which prevent cross-feature imports. But there is no established pattern for features that need to share state (e.g., auth session affecting dashboard data).
- Files: `.eslintrc.cjs`, `src/features/*/`
- Current capacity: Current 3 features don't need cross-communication. Adding features that depend on auth state or user preferences will require a shared state layer.
- Scaling path: Establish a pattern using React Context in `src/lib/` or event bus for cross-feature communication.

## Test Coverage Gaps

**No unit tests for API client, error classes, or mock handlers:**
- What's not tested: `src/lib/api/client.ts`, `src/lib/api/errors.ts`, `src/mocks/handlers.ts`, `src/mocks/data.ts`
- Files: `src/lib/api/client.ts`, `src/lib/api/errors.ts`, `src/mocks/handlers.ts`
- Risk: API client changes (adding auth headers, retry logic) could break without detection. Mock handler drift from real API contracts goes unnoticed.
- Priority: High

**No unit tests for shared components (Button, Input, Select, Modal, Spinner, EmptyState):**
- What's not tested: All components in `src/lib/components/` except the toast system.
- Files: `src/lib/components/Button.tsx`, `src/lib/components/Input.tsx`, `src/lib/components/Select.tsx`, `src/lib/components/Modal.tsx`, `src/lib/components/Spinner.tsx`, `src/lib/components/EmptyState.tsx`
- Risk: Component regressions (CSS class changes, prop handling) won't be caught until manual testing or E2E.
- Priority: Medium

**No E2E test for settings flow:**
- What's not tested: Changing theme, toggling notifications, saving settings, verifying persistence.
- Files: `tests/e2e/ops-journey.spec.ts`, `tests/fixtures/pages/SettingsPage.ts`
- Risk: Settings save may be broken without detection. The page object exists but is unused.
- Priority: Medium

**No test for ErrorBoundary recovery:**
- What's not tested: `src/lib/components/ErrorBoundary.tsx` — the reload button behavior and error logging.
- Files: `src/lib/components/ErrorBoundary.tsx`
- Risk: If ErrorBoundary fails to render or the reload doesn't work, the entire app becomes unrecoverable.
- Priority: Low

---

*Concerns audit: 2026-03-19*
