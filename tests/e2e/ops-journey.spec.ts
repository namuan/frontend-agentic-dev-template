import { test } from '@playwright/test';
import { AuthPage } from '../fixtures/pages/AuthPage';
import { DashboardPage } from '../fixtures/pages/DashboardPage';

test('operator signs in and reviews the live dashboard', async ({ page }) => {
  const auth = new AuthPage(page);
  await auth.goto();
  await auth.signIn('operator@northstar.ai', '123456');
  await auth.expectSignedIn();

  const dashboard = new DashboardPage(page);
  await dashboard.goto();
  await dashboard.expectSummary();
  await dashboard.expectSignalCards();
});
