import { test, expect } from "@playwright/test";
import { VerifyPage } from "../../pages/verify.page";
import { makeDeviceId } from "../../helpers/api";

test.describe("customer auth", () => {
  test("verify page loads", async ({ page }) => {
    const verify = new VerifyPage(page);
    await verify.goto();
    await expect(page).toHaveURL(/\/verify/);
    await expect(verify.input()).toBeVisible();
  });

  test("invalid code returns error (404 or 429 if rate limit hit)", async ({ request }) => {
    const res = await request.post("/api/verify-code", {
      data: { code: "EASE-XXXX-0000", device_id: makeDeviceId() },
    });
    // 404 for unknown code; 429 if earlier rate-limit test already exhausted the window
    expect([404, 429]).toContain(res.status());
  });

  test("malformed device_id returns 400", async ({ request }) => {
    const res = await request.post("/api/verify-code", {
      data: { code: "EASE-XXXX-0000", device_id: "bad-format" },
    });
    expect(res.status()).toBe(400);
  });

  test("session endpoint returns 401 without cookie", async ({ request }) => {
    const res = await request.get("/api/session");
    expect(res.status()).toBe(401);
  });

  test("protected route without session redirects to /verify", async ({ page }) => {
    await page.context().clearCookies();
    const res = await page.goto("/tracker");
    expect(res).toBeTruthy();
    await expect(page).toHaveURL(/\/verify/);
  });

  test.fixme("auto-fill from ?code= query populates input", async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto("/verify?code=EASE-ABCD-1234");
    // Wait for the client-side useEffect to hydrate and populate state.
    await page.waitForFunction(
      () => {
        const el = document.querySelector<HTMLInputElement>('input#access-code');
        return !!el && el.value === "EASE-ABCD-1234";
      },
      undefined,
      { timeout: 10_000 },
    );
    await ctx.close();
  });
});
