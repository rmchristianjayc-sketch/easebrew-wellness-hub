import { test, expect } from "../../fixtures/auth.fixture";

test.describe("customer notifications (PWA reminder card)", () => {
  test("service worker script is served", async ({ request }) => {
    // The customer browser context blocks SWs to avoid intercepting API calls
    // during tests. We verify the SW code itself is served correctly.
    const res = await request.get("/sw.js");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/SET_REMINDER|QUICK_LOG/);
  });

  test("manifest is served with correct fields", async ({ request }) => {
    const res = await request.get("/manifest.json");
    expect(res.ok()).toBeTruthy();
    const m = (await res.json()) as {
      name: string;
      display: string;
      icons: unknown[];
    };
    expect(m.name).toMatch(/EaseBrew/);
    expect(m.display).toBe("standalone");
    expect(m.icons.length).toBeGreaterThan(0);
  });
});
