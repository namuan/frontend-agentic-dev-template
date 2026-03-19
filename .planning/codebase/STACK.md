# Technology Stack

**Analysis Date:** 2026-03-19

## Languages

**Primary:**
- TypeScript 5.4+ — All source code, tests, and configuration
- CSS — Styling via CSS Modules and global token variables

**Secondary:**
- Bash — Automation scripts in `scripts/`

## Runtime

**Environment:**
- Node.js 24.10+ (development), Browser (production)

**Package Manager:**
- npm 11.6+
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- React 18.2+ — UI framework
- React Router DOM 6.14+ — Client-side routing via `createBrowserRouter`
- Vite 5.x — Build tool and dev server (port 5173)

**Testing:**
- Jest 29.7+ — Unit test runner (jsdom environment)
- Playwright 1.44+ — E2E test runner (tests in `tests/e2e/`)
- Testing Library — `@testing-library/react` 14.2+, `@testing-library/jest-dom` 6.4+, `@testing-library/user-event` 14.5+

**Build/Dev:**
- SWC 1.15+ — Fast JS/TS compilation (used by Jest via `@swc/jest` for `.js` files)
- TypeScript 5.4+ — Type checking (strict mode enabled, `tsc --noEmit`)

## Key Dependencies

**Critical:**
- `zod` 3.23+ — Runtime schema validation for API responses, localStorage, and form inputs
- `@tanstack/react-query` 5.x — Server state management (queries, mutations, caching)
- `react-router-dom` 6.14+ — Declarative routing with `createBrowserRouter`

**Infrastructure:**
- `msw` 2.x — API mocking for development and testing (browser worker + node server)

## Configuration

**TypeScript:**
- Target: ES2020
- Module resolution: Bundler
- Strict mode: enabled
- Path alias: `@/*` → `src/*` (defined in `tsconfig.json` and `vite.config.ts`)
- Config: `tsconfig.json` (app), `tsconfig.node.json` (config files)

**Linting:**
- ESLint 8.x with `@typescript-eslint` 6.x
- Plugins: `react`, `react-hooks`, `import`
- Config: `.eslintrc.cjs`
- Key rules: `no-console` (error, allow warn/error), `@typescript-eslint/no-explicit-any` (error)
- Import zones: Enforces feature domain isolation and lib layer boundaries

**Formatting:**
- No Prettier or Biome detected — formatting is not auto-enforced

**Environment:**
- `VITE_PORT` — Dev server port (default 5173)
- `.env*` files gitignored — no `.env.example` present

## Platform Requirements

**Development:**
- Node.js 24+
- Browser with modern JS support
- Fonts loaded from Google Fonts (Space Grotesk, Fraunces)

**Production:**
- Static SPA — no server-side rendering
- Deployed as static assets (Vite `build` output in `dist/`)

## Styling

**Approach:**
- CSS Modules for component-scoped styles (`*.module.css`)
- Global CSS tokens in `src/lib/styles/tokens.css` (colors, spacing, radii, shadows, transitions)
- Global reset and font imports in `src/lib/styles/global.css`
- Design token CSS variables: `--color-*`, `--space-*`, `--radius-*`, `--font-*`, `--shadow-*`

---

*Stack analysis: 2026-03-19*
