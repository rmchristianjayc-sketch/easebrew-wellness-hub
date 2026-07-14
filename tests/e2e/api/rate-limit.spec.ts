import { test, expect } from "@playwright/test";
import { makeDeviceId } from "../../helpers/api";

// Rate-limit tests intentionally exhaust per-IP + per-device counters.
// They are skipped by default to keep the auth fixture happy; enable
// with RUN_RATE_LIMIT_TESTS=1 when explicitly testing this control.
test.describe("API: rate limits", () => {
  test.skip(
    !process.env.RUN_RATE_LIMIT_TESTS,
    "set RUN_RATE_LIMIT_TESTS=1 to enable",
  );
  test("verify-code hits 429 after 10 rapid attempts per device", async ({
    request,
  }) => {
    const deviceId = makeDeviceId();
    let sawRateLimit = false;
    for (let i = 0; i < 12; i++) {
      const res = await request.post("/api/verify-code", {
        data: {
          code: `EASE-RATE-${String(i).padStart(4, "0").slice(0, 4)}`,
          device_id: deviceId,
        },
      });
      if (res.status() === 429) {
        sawRateLimit = true;
        break;
      }
    }
    expect(sawRateLimit).toBeTruthy();
  });

  test("admin/login hits 429 after ~8 wrong attempts", async ({ request }) => {
    // Use a unique username so we don't interfere with real admin login
    const uniqueUsername = `ratetest-${Date.now()}`;
    let sawRateLimit = false;
    for (let i = 0; i < 10; i++) {
      const res = await request.post("/api/admin/login", {
        data: { username: uniqueUsername, password: "wrong" },
      });
      if (res.status() === 429) {
        sawRateLimit = true;
        break;
      }
    }
    expect(sawRateLimit).toBeTruthy();
  });
});
