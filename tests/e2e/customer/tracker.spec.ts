import { test, expect } from "../../fixtures/auth.fixture";

test.describe("customer tracker", () => {
  test("tracker URL accessible (tier 999+)", async ({ customerPage, customerTier }) => {
    test.skip(customerTier < 999, "requires tier 999+");
    const res = await customerPage.goto("/tracker");
    expect(res).toBeTruthy();
    await expect(customerPage).toHaveURL(/\/tracker/);
  });

  test("save mood via API and read back", async ({ customerRequest }) => {
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Manila",
    });
    const entries = [{ date: today, mood: 8, painScore: 3, painLocations: [] }];
    const save = await customerRequest.post("/api/progress", {
      data: { type: "tracker", data: { entries } },
    });
    expect(save.status()).toBe(200);
    const rb = await customerRequest.get("/api/progress?type=tracker");
    const body = (await rb.json()) as {
      data?: { entries?: Array<{ date: string; mood: number }> };
    };
    const found = body.data?.entries?.find((e) => e.date === today);
    expect(found?.mood).toBe(8);
  });
});
