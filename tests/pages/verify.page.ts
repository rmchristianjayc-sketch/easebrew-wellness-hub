import type { Page } from "@playwright/test";

export class VerifyPage {
  constructor(readonly page: Page) {}
  async goto(codeQuery?: string) {
    await this.page.goto(codeQuery ? `/verify?code=${codeQuery}` : "/verify");
  }
  input() {
    return this.page.locator('input[type="text"]').first();
  }
  submit() {
    return this.page.getByRole("button", { name: /Continue|Kunin/i });
  }
  errorText() {
    return this.page.locator("text=/Invalid|expired|incomplete/i");
  }
}
