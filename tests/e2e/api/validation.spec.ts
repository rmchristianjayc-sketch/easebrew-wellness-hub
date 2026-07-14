import { test, expect } from "../../fixtures/auth.fixture";
import { makeDeviceId } from "../../helpers/api";

test.describe("API: input validation", () => {
  test("verify-code: malformed JSON → 400", async ({ request }) => {
    const res = await request.post("/api/verify-code", {
      headers: { "content-type": "application/json" },
      data: "notjson",
    });
    expect(res.status()).toBe(400);
  });

  test("verify-code: missing device_id → 400", async ({ request }) => {
    const res = await request.post("/api/verify-code", {
      data: { code: "EASE-TEST-0000" },
    });
    expect(res.status()).toBe(400);
  });

  test("verify-code: bad device_id format → 400", async ({ request }) => {
    const res = await request.post("/api/verify-code", {
      data: { code: "EASE-TEST-0000", device_id: "bad-format" },
    });
    expect(res.status()).toBe(400);
  });

  test("progress: malformed JSON is rejected (400 or 401)", async ({ customerRequest }) => {
    const res = await customerRequest.post("/api/progress", {
      headers: { "content-type": "application/json" },
      data: "notjson",
    });
    expect([400, 401]).toContain(res.status());
    expect(res.status()).not.toBe(500);
  });

  test("progress: over-limit entries (>500) → 400", async ({ customerRequest }) => {
    const entries = Array.from({ length: 600 }, () => ({ date: "2026-01-01" }));
    const res = await customerRequest.post("/api/progress", {
      data: { type: "tracker", data: { entries } },
    });
    expect(res.status()).toBe(400);
  });

  test("progress: out-of-range values → 400", async ({ customerRequest }) => {
    const res = await customerRequest.post("/api/progress", {
      data: {
        type: "tracker",
        data: { entries: [{ date: "2026-01-01", painScore: 999 }] },
      },
    });
    expect(res.status()).toBe(400);
  });

  test("family: invalid token → 404", async ({ request }) => {
    const res = await request.get("/api/family/invalid-token-xxx");
    expect(res.status()).toBe(404);
  });

  test("admin/login: malformed JSON → 400", async ({ request }) => {
    const res = await request.post("/api/admin/login", {
      headers: { "content-type": "application/json" },
      data: "notjson",
    });
    expect(res.status()).toBe(400);
  });

  test("admin/login: unknown user → 401", async ({ request }) => {
    const res = await request.post("/api/admin/login", {
      data: { username: "nobody", password: "anything" },
    });
    expect(res.status()).toBe(401);
  });

  // Reference generated helper to avoid "unused import" if we later strip a test
  test("makeDeviceId format check", () => {
    expect(makeDeviceId()).toMatch(/^dev_[0-9a-f]{32}$/);
  });
});
