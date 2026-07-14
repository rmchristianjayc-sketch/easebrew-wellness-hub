import { test, expect } from "@playwright/test";

test.describe("API: authorization boundaries (no session)", () => {
  const routes = [
    { method: "GET" as const, path: "/api/session" },
    { method: "GET" as const, path: "/api/admin/me" },
    { method: "GET" as const, path: "/api/admin/codes" },
    { method: "GET" as const, path: "/api/admin/content" },
    { method: "GET" as const, path: "/api/admin/audit-log?limit=1" },
    { method: "GET" as const, path: "/api/progress?type=tracker" },
    { method: "POST" as const, path: "/api/admin/generate-code", body: {} },
    { method: "POST" as const, path: "/api/admin/content", body: { updates: [] } },
    { method: "POST" as const, path: "/api/family/generate", body: {} },
  ];

  for (const r of routes) {
    test(`${r.method} ${r.path} → 401 without cookie`, async ({ request }) => {
      const res =
        r.method === "GET"
          ? await request.get(r.path, { headers: { cookie: "" } })
          : await request.post(r.path, {
              headers: { cookie: "" },
              data: r.body,
            });
      expect(res.status()).toBe(401);
    });
  }
});
