# Security invariants

## XSS prevention

- Always use React's built-in escaping. Never use `dangerouslySetInnerHTML` unless
  reviewing third-party content from a trusted source.
- Sanitize user-generated HTML with `html-escape` utility in `src/lib/utils/sanitize.ts`.
- Never construct URLs from user input without validation.

```tsx
// ❌ Vulnerable
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Safe
import { escape } from '@/lib/utils/sanitize';
<div>{escape(userContent)}</div>
```

## CSRF protection

- All state-mutating API requests (POST, PUT, DELETE) must include a CSRF token in
  the `X-CSRF-Token` header.
- The token is provided by the backend on page load and stored in `sessionStorage`.
- Never store sensitive tokens in `localStorage`.

## Authentication & tokens

- Access tokens are stored in memory only (not localStorage/sessionStorage).
- Refresh tokens are stored in secure, `httpOnly` cookies set by the backend.
- Token refresh is automatic via React Query interceptor in `src/lib/api/client.ts`.
- On logout, clear all in-memory state and request the backend to invalidate tokens.

## Sensitive data in logs & errors

- Never log passwords, tokens, API keys, or PII.
- Use `src/lib/utils/logger.ts` which sanitizes common patterns.
- In error messages shown to users, never include raw error details from external APIs—
  use developer-friendly error codes instead.

## Data in transit

- All API endpoints are HTTPS only. Never hard-code `http://` URLs in production builds.
- APIs should support CORS headers to prevent cross-origin abuse.
- Validate request origins in the backend; the frontend cannot enforce this alone.

## Content Security Policy

- A CSP header is configured in `public/index.html`.
- Never override it with inline `<script>` tags or event handlers.
- All analytics and third-party scripts must be explicitly whitelisted in the CSP header.

## Dependency security

- Run `npm audit` before each release. Critical/high vulnerabilities must be patched.
- Third-party libraries are pinned to exact versions in `package.json` to prevent
  automatic updates that could introduce regressions or vulnerabilities.
- Only add dependencies that are actively maintained and have a clear security disclosure process.

## User input validation

- All external input (API responses, URL params, form data) must be validated with Zod
  schemas before use. See [RELIABILITY.md](RELIABILITY.md) for details.
- File uploads are scanned for malicious content server-side; the frontend only
  validates MIME type and file size as a UX improvement.
