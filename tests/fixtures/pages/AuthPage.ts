import { expect, Page } from '@playwright/test';

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
