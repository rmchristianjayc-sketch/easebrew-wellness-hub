import { test, expect } from "../../fixtures/auth.fixture";

test.describe("admin content CRUD + live sync", () => {
  test("content URL accessible", async ({ adminPage }) => {
    const res = await adminPage.goto("/admin/content");
    expect(res).toBeTruthy();
    await expect(adminPage).toHaveURL(/\/admin\/content/);
  });

  test("edit + read-back round trip", async ({ adminRequest }) => {
    const testValue = `test-${Date.now()}`;
    const save = await adminRequest.post("/api/admin/content", {
      data: { updates: [{ key: "hero_title", value: testValue }] },
    });
    expect(save.status()).toBe(200);
    const read = await adminRequest.get(`/api/content?_=${Date.now()}`);
    const body = (await read.json()) as { content?: Record<string, string> };
    expect(body.content?.hero_title).toBe(testValue);
    await adminRequest.post("/api/admin/content", {
      data: {
        updates: [{ key: "hero_title", value: "Kamusta, Nanay at Tatay!" }],
      },
    });
  });

  test("unknown content key rejected", async ({ adminRequest }) => {
    const res = await adminRequest.post("/api/admin/content", {
      data: { updates: [{ key: "hacker_backdoor", value: "x" }] },
    });
    expect(res.status()).toBe(400);
  });

  test("malformed body rejected", async ({ adminRequest }) => {
    const res = await adminRequest.post("/api/admin/content", { data: {} });
    expect(res.status()).toBe(400);
  });
});
