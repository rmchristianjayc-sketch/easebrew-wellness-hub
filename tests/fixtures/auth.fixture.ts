/* eslint-disable react-hooks/rules-of-hooks -- Playwright fixtures use `use()` as a callback, not a React hook */
import {
  test as base,
  expect,
  type BrowserContext,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

type CookieInit = Parameters<BrowserContext["addCookies"]>[0][number];
import { config as loadEnv } from "dotenv";
import path from "node:path";
import { adminLogin, getActiveCustomerCode } from "../helpers/api";
import { signAdminJwt, signCustomerJwt } from "../helpers/jwt";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

/**
 * Fixtures that seed a logged-in session before each test.
 *
 * Auth is done ONCE PER WORKER (not per test) by signing JWTs directly with
 * JWT_SECRET, so we never spend rate-limit budget on verify-code / admin-login
 * during the test suite. Real auth endpoints are still tested in api/auth.spec.ts.
 */

type CustomerCodeInfo = {
  code: string;
  device_id: string;
  tier: number;
  packs: number;
  expires_at: string;
};

type WorkerFixtures = {
  customerCodeInfo: CustomerCodeInfo;
  customerCookies: CookieInit[];
  adminCookies: CookieInit[];
  customerContext: BrowserContext;
  adminContext: BrowserContext;
};

type TestFixtures = {
  customerPage: Page;
  adminPage: Page;
  customerCode: string;
  customerTier: number;
  customerRequest: APIRequestContext;
  adminRequest: APIRequestContext;
};

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

export const test = base.extend<TestFixtures, WorkerFixtures>({
  customerCodeInfo: [
    async ({ playwright }, use) => {
      const ctx = await playwright.request.newContext();
      const login = await adminLogin(ctx);
      expect(login.ok(), "admin login for fixture setup").toBeTruthy();
      const code = await getActiveCustomerCode(ctx);
      await ctx.dispose();
      expect(code, "at least one active customer code must exist").not.toBeNull();
      if (!code || !code.expires_at) throw new Error("no active code with expiry");
      await use({
        code: code.code,
        device_id: code.device_id ?? "",
        tier: code.tier,
        packs: (code as { packs?: number }).packs ?? 1,
        expires_at: code.expires_at,
      });
    },
    { scope: "worker" },
  ],

  customerCookies: [
    async ({ customerCodeInfo }, use) => {
      const token = await signCustomerJwt(customerCodeInfo);
      const url = new URL(BASE_URL);
      await use([
        {
          name: "eb_session",
          value: token,
          domain: url.hostname,
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
          expires: Math.floor(new Date(customerCodeInfo.expires_at).getTime() / 1000),
        },
      ]);
    },
    { scope: "worker" },
  ],

  adminCookies: [
    async ({}, use) => {
      const token = await signAdminJwt(
        process.env.TEST_ADMIN_USERNAME ?? "admin",
        "owner",
      );
      const url = new URL(BASE_URL);
      await use([
        {
          name: "eb_admin_token",
          value: token,
          domain: url.hostname,
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
          expires: Math.floor(Date.now() / 1000) + 12 * 3600,
        },
      ]);
    },
    { scope: "worker" },
  ],

  customerContext: [
    async ({ browser, customerCookies }, use) => {
      const ctx = await browser.newContext({ serviceWorkers: "block" });
      await ctx.addCookies(customerCookies);
      await use(ctx);
      await ctx.close();
    },
    { scope: "worker" },
  ],

  adminContext: [
    async ({ browser, adminCookies }, use) => {
      const ctx = await browser.newContext({ serviceWorkers: "block" });
      await ctx.addCookies(adminCookies);
      await use(ctx);
      await ctx.close();
    },
    { scope: "worker" },
  ],

  customerCode: async ({ customerCodeInfo }, use) => {
    await use(customerCodeInfo.code);
  },
  customerTier: async ({ customerCodeInfo }, use) => {
    await use(customerCodeInfo.tier);
  },

  customerRequest: async ({ browser, customerCookies }, use) => {
    // Build a temp browser context to get a valid storageState with the
    // signed session cookie, then use it for a fresh APIRequestContext.
    const bctx = await browser.newContext();
    await bctx.addCookies(customerCookies);
    const state = await bctx.storageState();
    await bctx.close();
    const req = await (
      await browser.newContext({ storageState: state })
    ).request;
    await use(req);
  },

  adminRequest: async ({ browser, adminCookies }, use) => {
    const bctx = await browser.newContext();
    await bctx.addCookies(adminCookies);
    const state = await bctx.storageState();
    await bctx.close();
    const req = await (
      await browser.newContext({ storageState: state })
    ).request;
    await use(req);
  },

  customerPage: async ({ customerContext }, use) => {
    const page = await customerContext.newPage();
    await use(page);
    await page.close();
  },

  adminPage: async ({ adminContext }, use) => {
    const page = await adminContext.newPage();
    await use(page);
    await page.close();
  },
});

export { expect };
