import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for R&M EaseBrew Wellness Hub.
 *
 * Runs against a locally-served Next.js dev server by default.
 * Override with PLAYWRIGHT_BASE_URL to hit a preview or production URL.
 *
 * See docs/TESTING.md for the full test authoring guide.
 */

const PORT = 3000;
// Use 127.0.0.1 explicitly — some Node versions resolve "localhost" to ::1
// before the dev server binds IPv6, causing ECONNREFUSED.
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;
const IS_CI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/global-setup.ts",
  fullyParallel: false, // API tests hit real Supabase — avoid races on shared state
  forbidOnly: IS_CI,    // fail CI if `.only` slipped in
  retries: IS_CI ? 2 : 0,
  workers: IS_CI ? 1 : undefined,
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
  ],
  timeout: 90_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 5"] },
      testMatch: "**/customer/*.spec.ts",
    },
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] },
      testMatch: "**/admin/*.spec.ts",
    },
    {
      name: "api",
      use: { baseURL: BASE_URL },
      testMatch: "**/api/*.spec.ts",
    },
  ],

  webServer: process.env.PLAYWRIGHT_SKIP_WEB_SERVER
    ? undefined
    : {
        command: "npm run dev",
        url: BASE_URL,
        reuseExistingServer: !IS_CI,
        timeout: 120_000,
      },
});
