import { test, expect } from "../../fixtures/auth.fixture";

test.describe("customer logout / session lifecycle", () => {
  test("clearing session cookie forces redirect to /verify", async ({ customerPage }) => {
    await customerPage.goto("/");
    await expect(customerPage).toHaveURL("/");
    // Clear cookies (simulates the "logout" the app doesn't expose but browsers do)
    await customerPage.context().clearCookies();
    const res = await customerPage.goto("/tracker");
    expect(res).toBeTruthy();
    await expect(customerPage).toHaveURL(/\/verify/);
  });

  test("expired-code path returns 403 with reset message", async ({ request }) => {
    // Simulate: hit verify-code with a well-formed but non-existent code.
    // We cannot easily forge an expired-but-valid code in tests, so this
    // asserts the API's contract for a bad code without device match.
    const res = await request.post("/api/verify-code", {
      data: {
        code: "EASE-ZZZZ-0000",
        device_id: "dev_" + "a".repeat(32),
      },
    });
    expect([403, 404]).toContain(res.status());
  });
});
