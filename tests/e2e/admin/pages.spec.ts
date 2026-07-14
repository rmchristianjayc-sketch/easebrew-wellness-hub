import { test, expect } from "../../fixtures/auth.fixture";

test.describe("admin page rendering", () => {
  const routes = [
    "/admin/notifications",
    "/admin/analytics",
    "/admin/audit-log",
    "/admin/exercises",
  ];

  for (const path of routes) {
    test(`${path} URL accessible`, async ({ adminPage }) => {
      const res = await adminPage.goto(path);
      expect(res).toBeTruthy();
      await expect(adminPage).toHaveURL(new RegExp(path.replace(/\//g, "\\/")));
    });
  }

  test("audit-log API returns entries", async ({ adminRequest }) => {
    const res = await adminRequest.get("/api/admin/audit-log?limit=5");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { entries?: unknown[] };
    expect(Array.isArray(body.entries)).toBeTruthy();
  });
});
