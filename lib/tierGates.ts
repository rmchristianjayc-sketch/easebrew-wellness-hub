// ============================================================
// TIER GATES — single source of truth para sa "anong tier ang
// kailangan para makapasok sa /X o makapag-save ng progress
// type Y".
//
// May dalawang uri ng features:
//   1. PAID (TIER_GATES) — may route gate sa middleware at data
//      gate sa /api/progress. Bawat isa may unique minimum tier.
//   2. FREE (FREE_PROGRESS_TYPES) — walang route gate sa
//      middleware (client-side useSessionGuard() lang). Data
//      gate sa /api/progress ay "any active session" (399+).
//
// Kung magdagdag ng bagong PAID feature:
//   1. Idagdag sa TIER_GATES.
//   2. Idagdag ang route sa `config.matcher` sa `proxy.ts`.
//
// Kung magdagdag ng bagong FREE tool:
//   1. Idagdag ang progress type sa FREE_PROGRESS_TYPES.
//   2. Client-side lang: gumamit ng useSessionGuard() sa page.
//      Walang kailangan sa proxy.ts.
// ============================================================

// PAID feature progress types
type PaidProgressType =
  | 'tracker'
  | 'mealplan'
  | 'exercise'
  | 'recipe_favorites'
  | 'bagong_katawan';

// FREE tool progress types (session-only, walang tier gate)
type FreeProgressType =
  | 'blood_pressure'
  | 'medication'
  | 'medical_card'
  | 'testimonial_submission';

export type ProgressType = PaidProgressType | FreeProgressType;

type Gate = { path: string; minTier: number };

// Minimum tier na binibigay ng pinakamurang order. Anumang
// active session ay may tier >= dito, kaya effectively "session-only".
const SESSION_MIN_TIER = 399;

export const TIER_GATES: Record<PaidProgressType, Gate> = {
  tracker:          { path: '/tracker',         minTier: 999  },
  mealplan:         { path: '/meal-plan',       minTier: 1499 },
  exercise:         { path: '/exercise',        minTier: 2998 },
  recipe_favorites: { path: '/recipes',         minTier: 1499 },
  bagong_katawan:   { path: '/bagong-katawan',  minTier: 4497 },
};

const FREE_PROGRESS_TYPES: readonly FreeProgressType[] = [
  'blood_pressure',
  'medication',
  'medical_card',
  'testimonial_submission',
];

// URL path → minimum tier (for middleware route gate).
// Free tools NOT included here — walang route gate sila.
export const MINIMUM_TIER_BY_PATH: Record<string, number> = Object.fromEntries(
  Object.values(TIER_GATES).map((g) => [g.path, g.minTier])
);

// Progress `type` string → minimum tier (for /api/progress data gate).
// Free types = SESSION_MIN_TIER (any active session).
export const MINIMUM_TIER_BY_TYPE: Record<string, number> = {
  ...Object.fromEntries(Object.entries(TIER_GATES).map(([type, g]) => [type, g.minTier])),
  ...Object.fromEntries(FREE_PROGRESS_TYPES.map((t) => [t, SESSION_MIN_TIER])),
};

// Paths na kailangan ng logged-in customer session (used by middleware).
// Kasama ang '/' na hindi tier-gated pero session-gated.
// Free tool routes hindi kasama — client-side useSessionGuard() lang.
export const PROTECTED_CUSTOMER_PATHS: string[] = [
  '/',
  ...Object.values(TIER_GATES).map((g) => g.path),
];
