import { test, expect } from "../../fixtures/auth.fixture";

test.describe("customer exercise videos", () => {
  test("exercise URL accessible (tier 2998+)", async ({ customerPage, customerTier }) => {
    test.skip(customerTier < 2998, "requires tier 2998+");
    const res = await customerPage.goto("/exercise");
    expect(res).toBeTruthy();
    await expect(customerPage).toHaveURL(/\/exercise/);
  });

  test("lower tier redirects away from exercise", async ({ customerPage, customerTier }) => {
    test.skip(customerTier >= 2998, "only lower tiers should be blocked");
    await customerPage.goto("/exercise");
    await expect(customerPage).toHaveURL(/\/\?locked=1/, { timeout: 10_000 });
  });
});
