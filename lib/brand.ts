// Central brand configuration — edit here, reflects everywhere
export const BRAND = {
  // Company identity
  company:     "R&M Digital Trading",
  productLine: "R&M EaseBrew",
  app:         "EaseBrew Wellness Hub",

  // Colors
  colors: {
    green:  "#39613B",
    gold:   "#FED255",
    amber:  "#C0863B",
    cream:  "#EEE5D4",
    white:  "#FFFFFB",
    dark:   "#1B201A",
    mid:    "#4E504F",
  },

  // Contact / social (update when needed)
  facebook: "https://www.facebook.com/rmeasebrew",
  email:    "rmeasebrew@gmail.com",

  // Footer text
  footer: "R&M EaseBrew Wellness Hub",
  tagline: "Para sa mas malusog na pamilya",
} as const;

export type BrandColors = typeof BRAND.colors;
