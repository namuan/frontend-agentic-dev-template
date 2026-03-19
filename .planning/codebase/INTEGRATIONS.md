# External Integrations

**Analysis Date:** 2026-03-19

## APIs & External Services

**No real external APIs detected.** The application uses MSW (Mock Service Worker) to simulate all API calls in both development and testing environments.

**Mocked API endpoints (defined in `src/mocks/handlers.ts`):**
- `GET /api/session` — Fetch current session state
- `POST /api/login` — Create a new session (returns token + user)
- `POST /api/logout` — Clear session
- `GET /api/dashboard` — Fetch dashboard summary and signal data
- `GET /api/settings` — Fetch user preferences
- `POST /api/settings` — Update user preferences

**API Client:**
- Location: `src/lib/api/client.ts`
- Implementation: Native `fetch` wrapper with Zod schema validation
- Methods: `apiClient.get(path, schema)`, `apiClient.post(path, body, schema)`
- Error handling: `ApiError` for HTTP errors, `ParseError` for Zod validation failures
- All responses validated with Zod schemas defined in `src/lib/types/`

**MSW Configuration:**
- Browser worker: `src/mocks/browser.ts` → `public/mockServiceWorker.js` (MSW v2.12.13)
- Node server (tests): `tests/fixtures/server.ts`
- Started conditionally: `import.meta.env.DEV` (only in development)
- Mock data: `src/mocks/data.ts` (in-memory state for session, dashboard, settings)

## Data Storage

**Client-side only:**
- `localStorage` — Used via `src/lib/utils/storage.ts` (read/write/remove with Zod validation)
- No database, no server-side persistence

**File Storage:**
- None — all data is in-memory mock state

**Caching:**
- React Query (`@tanstack/react-query`) with `staleTime: 30_000` (30 seconds)
- Query retry logic: retries on server errors (status >= 500), no retry on client errors

## Authentication & Identity

**Auth Provider:**
- Custom mock implementation (no real auth service)
- Session stored in mock data: `src/mocks/data.ts`
- Token format: `'demo-token-2026-aurora'` (hardcoded demo token)
- Session expiry: 30 days from creation (`2026-04-17T08:00:00.000Z`)
- Login payload: email + accessCode (validated by Zod `loginSchema` in `src/features/auth/types.ts`)
- Session management via React Query cache (`['session']` query key)

## Monitoring & Observability

**Error Tracking:**
- None — no Sentry, Datadog, or similar service integrated

**Logs:**
- Custom `logger` utility in `src/lib/utils/logger.ts`
- Levels: `info` (dev only), `warn`, `error`
- `info` logs suppressed in production
- No external log aggregation

## CI/CD & Deployment

**Hosting:**
- Static SPA — built with `vite build`, output to `dist/`
- No deployment target configured (framework-agnostic static hosting)

**CI Pipeline:**
- Agent automation scripts in `scripts/`:
  - `agent-review.sh` — Runs Codex CLI code review against branch diff
  - `pr-loop.sh` — Iterative lint/typecheck/test/review loop (max 5 iterations)
  - `check-file-sizes.sh` — Enforces 200-line max for component files
  - `check-testids.sh` — Warns on missing `data-testid` attributes
  - `garbage-collect.sh` — Weekly automated cleanup (quality scores, Zod checks, dedup, doc freshness)
- Requires: `codex` CLI, `gh` CLI, `git`
- External AI service: OpenAI Codex (via `codex --model $CODEX_MODEL`, default `o4-mini`)

## Environment Configuration

**Required env vars:**
- `VITE_PORT` — Dev server port (optional, defaults to 5173)
- `CODEX_MODEL` — AI model for agent scripts (optional, defaults to `o4-mini`)

**Secrets location:**
- `.env*` files gitignored
- No `.env.example` or secret management detected

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None — no real API calls are made; all requests intercepted by MSW

---

*Integration audit: 2026-03-19*
