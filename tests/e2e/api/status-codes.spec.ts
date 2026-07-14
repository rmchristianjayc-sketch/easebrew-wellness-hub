import { test, expect } from "@playwright/test";

test.describe("API: correct status codes for common paths", () => {
  test("GET /api/content is 200 with cache header", async ({ request }) => {
    const res = await request.get("/api/content");
    expect(res.status()).toBe(200);
    const cache = res.headers()["cache-control"];
    expect(cache).toMatch(/s-maxage=\d+/);
  });

  test("GET /robots.txt is 200", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Disallow:/);
  });

  test("GET /manifest.json is 200", async ({ request }) => {
    const res = await request.get("/manifest.json");
    expect(res.status()).toBe(200);
  });

  test("GET /sw.js is 200", async ({ request }) => {
    const res = await request.get("/sw.js");
    expect(res.status()).toBe(200);
  });

  test("GET /offline.html is 200", async ({ request }) => {
    const res = await request.get("/offline.html");
    expect(res.status()).toBe(200);
  });

  test("unknown page is 404", async ({ request }) => {
    const res = await request.get("/does-not-exist");
    expect(res.status()).toBe(404);
  });

  test("unknown API path is 404", async ({ request }) => {
    const res = await request.get("/api/does-not-exist");
    expect(res.status()).toBe(404);
  });

  test("security headers set on all responses", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["strict-transport-security"]).toMatch(/max-age=\d+/);
    expect(h["content-security-policy"]).toMatch(/default-src 'self'/);
  });
});
