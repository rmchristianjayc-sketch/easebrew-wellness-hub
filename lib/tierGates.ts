// ============================================================
// TIER GATES — single source of truth para sa "anong tier ang
// kailangan para makapasok sa /X o makapag-save ng progress
// type Y". Dati nakadalawa 'to (`proxy.ts` + `app/api/progress`)
// at nag-drift; consolidated dito para isang tugma na lang.
//
// Kung magdagdag ng bagong gated feature:
//   1. Idagdag dito sa TIER_GATES.
//   2. Idagdag ang route sa `config.matcher` sa `proxy.ts`
//      (Next.js middleware requires a static matcher list).
//
// `products.ts` may sarili pa ring tier per product para sa
// display/order-page purposes — hindi kailangan i-sync dito
// kasi UI-only yon, hindi enforcement.
// ============================================================

export type ProgressType =
  | 'tracker'
  | 'water'
  | 'mealplan'
  | 'exercise'
  | 'recipe_favorites'
  | 'bagong_katawan';

type Gate = { path: string; minTier: number };

export const TIER_GATES: Record<ProgressType, Gate> = {
  tracker:          { path: '/tracker',         minTier: 999  },
  water:            { path: '/water',           minTier: 999  },
  mealplan:         { path: '/meal-plan',       minTier: 1499 },
  exercise:         { path: '/exercise',        minTier: 1499 },
  recipe_favorites: { path: '/recipes',         minTier: 2998 },
  bagong_katawan:   { path: '/bagong-katawan',  minTier: 4497 },
};

// URL path → minimum tier (for middleware route gate)
export const MINIMUM_TIER_BY_PATH: Record<string, number> = Object.fromEntries(
  Object.values(TIER_GATES).map((g) => [g.path, g.minTier])
);

// Progress `type` string → minimum tier (for /api/progress data gate)
export const MINIMUM_TIER_BY_TYPE: Record<string, number> = Object.fromEntries(
  Object.entries(TIER_GATES).map(([type, g]) => [type, g.minTier])
);

// Paths na kailangan ng logged-in customer session (used by middleware).
// Kasama ang '/' na hindi tier-gated pero session-gated.
export const PROTECTED_CUSTOMER_PATHS: string[] = [
  '/',
  ...Object.values(TIER_GATES).map((g) => g.path),
];
