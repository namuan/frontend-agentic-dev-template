import { expect, Page } from '@playwright/test';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async expectSummary(): Promise<void> {
    await expect(this.page.getByTestId('summary-healthy')).toBeVisible();
    await expect(this.page.getByTestId('summary-watch')).toBeVisible();
    await expect(this.page.getByTestId('summary-critical')).toBeVisible();
  }

  async expectSignalCards(): Promise<void> {
    await expect(this.page.getByTestId('signal-sig-1')).toBeVisible();
    await expect(this.page.getByTestId('signal-sig-2')).toBeVisible();
    await expect(this.page.getByTestId('signal-sig-3')).toBeVisible();
  }
}
