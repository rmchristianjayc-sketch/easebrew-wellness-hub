import type { Page } from "@playwright/test";

export class AdminLoginPage {
  constructor(readonly page: Page) {}
  async goto() {
    await this.page.goto("/admin/login");
  }
  username() {
    return this.page.locator('input[autocomplete="username"]');
  }
  password() {
    return this.page.locator('input[autocomplete="current-password"]');
  }
  submit() {
    return this.page.getByRole("button", { name: /Sign in|Continue|Login/i });
  }
}
