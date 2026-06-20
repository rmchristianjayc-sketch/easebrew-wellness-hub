// ============================================================
// PRICING CONFIG — single source of truth
// Inilipat mula sa lib/supabase.ts para hindi ma-import
// ang supabaseAdmin sa client-side pages
// ============================================================

export const PRICE_CONFIG: Record<number, { packs: number; validityDays: number; label: string }> = {
    399:   { packs: 1,  validityDays: 10,  label: '1 Pack — ₱399'      },
    699:   { packs: 2,  validityDays: 20,  label: '2 Packs — ₱699'     },
    999:   { packs: 3,  validityDays: 30,  label: '3 Packs — ₱999'     },
    1499:  { packs: 5,  validityDays: 45,  label: '5 Packs — ₱1,499'   },
    2998:  { packs: 10, validityDays: 75,  label: '10 Packs — ₱2,998'  },
    4497:  { packs: 15, validityDays: 105, label: '15 Packs — ₱4,497'  },
    5996:  { packs: 20, validityDays: 135, label: '20 Packs — ₱5,996'  },
    7499:  { packs: 25, validityDays: 165, label: '25 Packs — ₱7,499'  },
    8994:  { packs: 30, validityDays: 195, label: '30 Packs — ₱8,994'  },
    11992: { packs: 40, validityDays: 255, label: '40 Packs — ₱11,992' },
    14990: { packs: 50, validityDays: 315, label: '50 Packs — ₱14,990' },
  };