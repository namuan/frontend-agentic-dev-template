import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    testIdAttribute: 'data-testid',
  },
  webServer: {
    command: 'VITE_PORT=5173 npm run dev -- --host',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
