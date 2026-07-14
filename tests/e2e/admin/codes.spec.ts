import { test, expect } from "../../fixtures/auth.fixture";

test.describe("admin codes CRUD via API", () => {
  test("list codes returns array", async ({ adminRequest }) => {
    const res = await adminRequest.get("/api/admin/codes?limit=5");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { codes?: unknown[] };
    expect(Array.isArray(body.codes)).toBeTruthy();
  });

  test("generate + delete round-trip", async ({ adminRequest }) => {
    const gen = await adminRequest.post("/api/admin/generate-code", {
      data: {
        tier: 999,
        packs: 3,
        expiryDays: 30,
        customer_name: "Playwright QA",
        customerName: "Playwright QA",
      },
    });
    expect(gen.status()).toBe(200);
    const body = (await gen.json()) as { code?: { code: string; id: string } };
    const newCode = body.code?.code;
    const newId = body.code?.id;
    expect(newCode).toMatch(/^EASE-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    if (newId) {
      const del = await adminRequest.delete("/api/admin/codes", {
        data: { id: newId },
      });
      expect([200, 204]).toContain(del.status());
    }
  });

  test("missing customer name is rejected", async ({ adminRequest }) => {
    const res = await adminRequest.post("/api/admin/generate-code", {
      data: { tier: 999 },
    });
    expect(res.status()).toBe(400);
  });

  test("codes URL accessible", async ({ adminPage }) => {
    const res = await adminPage.goto("/admin/codes");
    expect(res).toBeTruthy();
    await expect(adminPage).toHaveURL(/\/admin\/codes/);
  });
});
