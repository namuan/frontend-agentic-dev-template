// Add these to your existing package.json "scripts" section:
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx --max-warnings 0",
    "typecheck": "tsc --noEmit",
    "test": "jest --passWithNoTests",
    "test:coverage": "jest --coverage --passWithNoTests",
    "e2e": "playwright test",
    "e2e:headed": "playwright test --headed",
    "check": "npm run lint && npm run typecheck && npm run test",
    "check:sizes": "bash scripts/check-file-sizes.sh",
    "check:testids": "bash scripts/check-testids.sh",
    "agent:review": "bash scripts/agent-review.sh",
    "agent:pr-loop": "bash scripts/pr-loop.sh",
    "agent:gc": "bash scripts/garbage-collect.sh"
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// .github/workflows/ci.yml
// ─────────────────────────────────────────────────────────────────────────────

/*
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npm run typecheck

      - name: Unit tests
        run: npm run test:coverage

      - name: File size check
        run: npm run check:sizes

      - name: data-testid audit (warning)
        run: npm run check:testids

  e2e:
    runs-on: ubuntu-latest
    needs: check
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npx playwright install --with-deps chromium

      - name: E2E tests
        run: npm run e2e

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
*/
