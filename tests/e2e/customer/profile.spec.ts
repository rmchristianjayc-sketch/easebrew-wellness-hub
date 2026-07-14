import { test, expect } from "../../fixtures/auth.fixture";

test.describe("customer profile (medical card)", () => {
  test("medical card URL is accessible with session", async ({ customerPage }) => {
    const res = await customerPage.goto("/medical-card");
    expect(res).toBeTruthy();
    await expect(customerPage).toHaveURL(/\/medical-card/);
  });

  test.fixme("all inputs have accessible labels", async ({ customerPage }) => {
    await customerPage.goto("/medical-card");
    const unlabeled = await customerPage.evaluate(() => {
      const inputs = Array.from(
        document.querySelectorAll("input, textarea, select"),
      ).filter((i) => (i as HTMLInputElement).type !== "hidden");
      return inputs.filter((i) => {
        if (i.getAttribute("aria-label")) return false;
        if (i.getAttribute("aria-labelledby")) return false;
        const id = i.getAttribute("id");
        if (id && document.querySelector(`label[for="${id}"]`)) return false;
        return !i.closest("label");
      }).length;
    });
    expect(unlabeled).toBe(0);
  });
});
