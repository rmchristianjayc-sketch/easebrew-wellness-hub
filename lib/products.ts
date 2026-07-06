// ============================================================
// PRODUCTS — single source of truth para sa tier→product mapping
//
// Dati, 2 magkaibang structures ang naglalarawan ng parehong
// business logic:
// - verify/page.tsx: DEFAULT_PERKS (array of TIERS, may gifts[])
//                     + TIER_TO_PRODUCT_IDS
// - app/page.tsx:     DEFAULT_PRODUCTS (array of PRODUCTS, may tier)
//                     + APP_LABELS
//
// Pareho silang naglalarawan kung anong product ang naka-unlock
// sa anong tier — pero dahil dalawang hiwalay na structures,
// posibleng mag-drift sila sa isa't isa (hal. kung dagdagan mo
// ng bagong tier sa PRICE_CONFIG, kailangan i-update ang DALAWA
// nang manual).
//
// Dito, products-first ang structure (isang listahan ng products,
// bawat isa may sariling minimum tier). Mula dito, ma-derive ang
// dalawang views na kailangan ng dalawang pages.
//
// Ginagamit sa: app/page.tsx, app/verify/page.tsx
// ============================================================

export type Product = {
    id: number;
    icon: string;
    name: string;
    desc: string;
    tier: number;        // minimum tier kailangan para ma-unlock
    tierLabel: string;   // display label, e.g. "3 Packs (₱999)"
    appUrl: string;       // route papunta sa actual tool
    appLabel: string;     // button label, e.g. "📊 Open ang Tracker"
  };
  
  export const DEFAULT_PRODUCTS: Product[] = [
    {
      id: 1, icon: "📊", name: "Daily Health Tracker",
      desc: "Track your pain levels, energy, and weight daily. Simple — just 1 minute per day.",
      tier: 999, tierLabel: "3 Packs (₱999)",
      appUrl: "/tracker", appLabel: "📊 Open Tracker",
    },
    {
      id: 2, icon: "🥗", name: "Meal Plan + Recipe Book",
      desc: "50-day Pinoy-friendly meal plan and 30 healthy recipes for joint pain, arthritis, and fatigue.",
      tier: 1499, tierLabel: "5 Packs (₱1,499)",
      appUrl: "/meal-plan", appLabel: "🥗 Open Meal Plan",
    },
    {
      id: 3, icon: "💪", name: "Home Exercise Guide",
      desc: "Gentle exercises you can do at home. For those with joint pain — no gym needed.",
      tier: 2998, tierLabel: "10 Packs (₱2,998)",
      appUrl: "/exercise", appLabel: "💪 Open Exercises",
    },
    {
      id: 4, icon: "🏆", name: "Complete Wellness Program",
      desc: "Everything included: 90-day program, full exercise plan, meal guide, and weekly check-in. The complete package.",
      tier: 4497, tierLabel: "15 Packs (₱4,497)",
      appUrl: "/bagong-katawan", appLabel: "🏆 Open Program",
    },
  ];
  
  // ─── Helper para sa app/page.tsx ────────────────────────────
  // Hinihiwalay ang products sa unlocked/locked base sa customer's
  // current tier. Ginagamit sa Gifts tab ng hub page.
  export function splitByTier(products: Product[], customerTier: number) {
    return {
      unlocked: products.filter(p => p.tier <= customerTier),
      locked:   products.filter(p => p.tier > customerTier),
    };
  }
  
  // ─── Helper para sa verify/page.tsx ─────────────────────────
  // I-grupo ang products base sa tier nila — para sa bawat tier
  // na may package option, alamin kung anong products ang
  // naka-unlock dun. Ito ang papalit sa TIER_TO_PRODUCT_IDS +
  // DEFAULT_PERKS.gifts logic.
  export function getGiftsForTier(products: Product[], tier: number): string[] {
    return products
      .filter(p => p.tier <= tier && p.tier > 0)
      .map(p => `${p.icon} ${p.name}`);
  }
  
  // ─── Helper — kunin lang ang minimum tier ng bawat unique tier
  // na kasama sa products. Ginagamit para malaman kung saang mga
  // tier-tier mayroon talagang bagong unlocked gift (hindi lahat
  // ng tier sa PRICE_CONFIG ay may bagong gift, e.g. 399 at 699
  // ay walang gift, 999 ang una).
  export function getProductTierThresholds(products: Product[]): number[] {
    const tiers = new Set(products.map(p => p.tier));
    return Array.from(tiers).sort((a, b) => a - b);
  }
  
  // ─── Content-override builder ───────────────────────────────
  // Pareho ang ginagawa nito sa lumang buildGifts() sa verify/page
  // at sa products.map() override sa app/page — kinukuha ang
  // pangalan/desc mula sa admin-edited content (/api/content)
  // kung meron, fallback sa default kung wala.
  export function applyContentOverrides(
    products: Product[],
    content: Record<string, string>
  ): Product[] {
    return products.map(p => ({
      ...p,
      name: content[`product_${p.id}_name`]?.trim() || p.name,
      desc: content[`product_${p.id}_desc`]?.trim()  || p.desc,
    }));
  }