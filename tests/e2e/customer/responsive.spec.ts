import { test, expect } from "../../fixtures/auth.fixture";
import fs from "node:fs";
import path from "node:path";

/**
 * Responsive audit: check every customer-facing page across common mobile
 * viewport widths for horizontal overflow, and record any element whose
 * right edge escapes the viewport (excluding intentional
 * overflow-x scrollers like category chip strips).
 *
 * Skips heavy visual snapshots — just numeric overflow + screenshot only
 * when a page fails. Screenshots go to test-results/responsive/ so the
 * owner can eyeball anything the audit flags.
 */

const VIEWPORTS = [
  { w: 320, h: 568, label: "iPhone SE 1st gen (smallest common)" },
  { w: 360, h: 640, label: "common Android baseline" },
  { w: 375, h: 667, label: "iPhone 8 / SE 2/3" },
  { w: 390, h: 844, label: "iPhone 12/13/14" },
  { w: 414, h: 896, label: "iPhone Plus / Pro Max older" },
] as const;

// Every customer-facing route. Admin/coach intentionally excluded — they
// are desktop-only per product spec.
const PUBLIC_ROUTES = ["/verify", "/privacy"] as const;
const AUTHED_ROUTES = [
  "/",
  "/tracker",
  "/blood-pressure",
  "/medication",
  "/medical-card",
  "/bmi",
  "/report",
  "/exercise",
  "/meal-plan",
  "/recipes",
  "/bagong-katawan",
] as const;

const OUT_DIR = path.resolve(process.cwd(), "test-results/responsive");
fs.mkdirSync(OUT_DIR, { recursive: true });

// Detects real overflow. An element is "escaping" if its right edge
// exceeds the viewport, AND no ancestor scroll container is clipping it
// (i.e. it's not inside a horizontally-scrollable strip like the recipe
// category chips or the exercise day carousel — those are intentional).
async function measureOverflow(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const vw = window.innerWidth;
    const escapes: { tag: string; right: number; width: number; text: string }[] = [];
    document.querySelectorAll("body *").forEach((el) => {
      const r = (el as HTMLElement).getBoundingClientRect();
      if (r.right > vw + 2 && r.width > 5 && r.width < 2000) {
        let p: HTMLElement | null = el.parentElement;
        let insideScroller = false;
        while (p) {
          const cs = getComputedStyle(p);
          if (cs.overflowX === "auto" || cs.overflowX === "scroll") {
            insideScroller = true;
            break;
          }
          p = p.parentElement;
        }
        if (!insideScroller) {
          escapes.push({
            tag: (el as HTMLElement).tagName,
            right: Math.round(r.right),
            width: Math.round(r.width),
            text: ((el as HTMLElement).innerText || "").trim().slice(0, 60),
          });
        }
      }
    });
    return {
      docWidth: document.documentElement.scrollWidth,
      viewportWidth: vw,
      hasHorizontalScroll: document.documentElement.scrollWidth > vw,
      escapes,
    };
  });
}

for (const vp of VIEWPORTS) {
  test.describe(`Responsive @ ${vp.w}px (${vp.label})`, () => {
    for (const route of PUBLIC_ROUTES) {
      test(`public ${route} has no overflow`, async ({ browser }) => {
        const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
        const page = await ctx.newPage();
        await page.goto(route, { waitUntil: "networkidle" });
        const result = await measureOverflow(page);
        if (result.hasHorizontalScroll || result.escapes.length > 0) {
          await page.screenshot({
            path: path.join(OUT_DIR, `${vp.w}px_${route.replace(/\//g, "_") || "root"}.png`),
            fullPage: true,
          });
        }
        await ctx.close();
        expect.soft(result.hasHorizontalScroll, `page-level horizontal scroll on ${route} @ ${vp.w}px`).toBe(false);
        expect
          .soft(
            result.escapes.length,
            `${result.escapes.length} elements escape viewport on ${route} @ ${vp.w}px:\n${JSON.stringify(result.escapes.slice(0, 5), null, 2)}`,
          )
          .toBe(0);
      });
    }

    for (const route of AUTHED_ROUTES) {
      test(`authed ${route} has no overflow`, async ({ browser, customerCookies }) => {
        const ctx = await browser.newContext({
          viewport: { width: vp.w, height: vp.h },
          serviceWorkers: "block",
        });
        await ctx.addCookies(customerCookies);
        const page = await ctx.newPage();
        await page.goto(route, { waitUntil: "networkidle" });
        // Dismiss onboarding modal if present (fires once on /).
        const skip = page.getByRole("button", { name: /Laktawan/i });
        if (await skip.count()) await skip.first().click().catch(() => {});
        await page.waitForTimeout(400);
        const result = await measureOverflow(page);
        if (result.hasHorizontalScroll || result.escapes.length > 0) {
          await page.screenshot({
            path: path.join(OUT_DIR, `${vp.w}px_${route.replace(/\//g, "_") || "root"}.png`),
            fullPage: true,
          });
        }
        await ctx.close();
        expect.soft(result.hasHorizontalScroll, `page-level horizontal scroll on ${route} @ ${vp.w}px`).toBe(false);
        expect
          .soft(
            result.escapes.length,
            `${result.escapes.length} elements escape viewport on ${route} @ ${vp.w}px:\n${JSON.stringify(result.escapes.slice(0, 5), null, 2)}`,
          )
          .toBe(0);
      });
    }
  });
}
