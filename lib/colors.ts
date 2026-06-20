// ============================================================
// BRAND COLORS — single source of truth
//
// Ito ang JS/TS export ng parehong hex values na nasa
// @theme block ng app/globals.css. Gamitin ito kapag
// kailangan mo ng actual string value sa JS (chart colors,
// dynamic/data-driven badge colors, inline style na
// COMPUTED-AT-RUNTIME lang).
//
// Para sa static layout/spacing/color — gumamit ng Tailwind
// classes na auto-generated mula sa @theme (bg-brand-green,
// text-brand-gold, atbp), HINDI ito.
//
// Bawal na: const G = "#39613B" sa bawat page. Mag-import
// dito imbes.
// ============================================================

export const COLORS = {
    green:       '#39613B',
    greenLight:  '#7DAE2F',
    greenPale:   '#E8F5E0',
    gold:        '#FED255',
    amber:       '#C0863B',
    brown:       '#7F523C',
    cream:       '#EEE5D4',
    creamLight:  '#FFFFFB',
    ink:         '#1B201A',
    inkMid:      '#4E504F',
  } as const;
  
  // ─── Backward-compatible aliases ────────────────────────────
  // Ginawa ito para sa mas madaling migration ng existing pages —
  // ang mga pages ay gumagamit ng iba't ibang variable names
  // (G, GOLD, AMBER, DARK, MID, CREAM, WHITE) para sa parehong
  // hex values. Sa bawat page, i-destructure lang ang COLORS at
  // gamitin ang mga pangalan na ito, o direkta gamitin ang
  // COLORS.green, COLORS.gold, etc.
  export const G     = COLORS.green;
  export const GOLD  = COLORS.gold;
  export const AMBER = COLORS.amber;
  export const CREAM = COLORS.cream;
  export const WHITE = COLORS.creamLight;
  export const DARK  = COLORS.ink;
  export const MID   = COLORS.inkMid;
  export const LIGHT_G = COLORS.greenLight;