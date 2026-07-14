import { test, expect } from "../../fixtures/auth.fixture";

test.describe("admin dashboard", () => {
  test("dashboard URL accessible with admin session", async ({ adminPage }) => {
    const res = await adminPage.goto("/admin");
    expect(res).toBeTruthy();
    await expect(adminPage).toHaveURL("/admin");
  });

  test.fixme("dashboard renders with sidebar + stat cards", async ({ adminPage }) => {
    await adminPage.goto("/admin");
    await expect(adminPage.locator("body")).toContainText(/Active Customers|Total Revenue/i);
  });

  test.fixme("needs attention panel shows", async ({ adminPage }) => {
    await adminPage.goto("/admin");
    await expect(adminPage.locator("body")).toContainText(/Needs [Aa]ttention/i);
  });
});
